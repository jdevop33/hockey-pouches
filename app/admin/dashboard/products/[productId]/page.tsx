'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/layout/NewLayout';
import { useAuth } from '@/context/AuthContext';
import ImageUploader from '@/components/ImageUploader';

import { Product, ProductVariation } from '@/types/index';

// Define Product type for this page
type ProductDetails = Product & {
  variations?: ProductVariation[];
};

export default function AdminProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const productIdString = params.productId as string;
  const productId = productIdString ? parseInt(productIdString) : undefined;

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ProductDetails>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Variations state
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [isLoadingVariations, setIsLoadingVariations] = useState(false);
  const [variationError, setVariationError] = useState<string | null>(null);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [currentVariation, setCurrentVariation] = useState<Partial<ProductVariation> | null>(null);
  const [isSavingVariation, setIsSavingVariation] = useState(false);

  // --- Effects ---
  useEffect(() => {
    if (!authLoading && (!user || !token || user.role !== 'Admin')) {
      router.push('/login?redirect=/admin/dashboard');
    }
  }, [user, token, authLoading, router]);

  useEffect(() => {
    if (user && token && user.role === 'Admin' && productId) {
      const loadProduct = async () => {
        setIsLoadingData(true);
        setError(null);
        try {
          const response = await fetch(`/api/admin/products/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) {
            if (response.status === 401) {
              logout();
              router.push('/login');
              return;
            }
            if (response.status === 404) {
              throw new Error('Product not found.');
            }
            throw new Error(`Failed to fetch product (${response.status})`);
          }
          const data = await response.json();
          setProduct(data as ProductDetails);
          setEditData(data);
        } catch (err: unknown) {
          const error = err as Error;
          setError(error.message || 'Failed to load product details.');
          console.error(err);
        } finally {
          setIsLoadingData(false);
        }
      };
      loadProduct();
    }
  }, [user, token, productId, router, logout]);

  // Load variations from API - define before it's used in useEffect
  const loadVariations = useCallback(async () => {
    if (!product?.id || !token) return;

    setIsLoadingVariations(true);
    setVariationError(null);

    try {
      const response = await fetch(`/api/admin/products/${product.id}/variations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          router.push('/login');
          return;
        }
        throw new Error(`Failed to load variations (${response.status})`);
      }

      const data = await response.json();
      setVariations(data as ProductVariation[]);
    } catch (err: unknown) {
      const error = err as Error;
      setVariationError(error.message || 'Failed to load variations.');
      console.error(err);
    } finally {
      setIsLoadingVariations(false);
    }
  }, [product?.id, token, logout, router]);

  // Load variations when product is loaded
  useEffect(() => {
    if (product?.id && token) {
      loadVariations();
    }
  }, [product?.id, token, loadVariations]);

  // --- Handlers ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let finalValue: string | number | boolean | ProductVariation[] | null = value;
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (
      type === 'number' ||
      name === 'price' ||
      name === 'compare_at_price' ||
      name === 'strength'
    ) {
      finalValue = value === '' ? null : parseFloat(value);
      if (value !== '' && isNaN(finalValue as number)) {
        // Handle the case where the value might be an array of variations
        if (name === 'variations') {
          finalValue = editData.variations || [];
        } else {
          const fieldValue = editData[name as keyof ProductDetails];
          finalValue = name in editData && fieldValue !== undefined ? fieldValue : null;
        }
      }
    }
    setEditData((prev: Partial<ProductDetails>) => ({ ...prev, [name]: finalValue }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !token) return;
    setIsSaving(true);
    setError(null);

    const payload: Partial<ProductDetails> = {};
    let hasChanges = false;

    (Object.keys(editData) as Array<keyof ProductDetails>).forEach(key => {
      if (key === 'id') return;
      const currentVal = product[key];
      let editedVal = editData[key];
      if (
        editedVal === '' &&
        ['description', 'category', 'image_url', 'compare_at_price', 'strength'].includes(
          String(key)
        )
      ) {
        editedVal = null;
      }
      if (typeof currentVal === 'number' && typeof editedVal === 'string') {
        editedVal = parseFloat(editedVal);
        if (isNaN(editedVal as number)) editedVal = null;
      }
      if (editedVal === '') editedVal = null;

      if (editedVal !== currentVal) {
        // Explicitly type assignment based on key
        switch (key) {
          case 'name':
          case 'description':
          case 'category':
          case 'image_url':
            payload[key] = editedVal === null ? undefined : (editedVal as string);
            break;
          case 'price':
          case 'compare_at_price':
          case 'strength':
            payload[key] = editedVal === null ? undefined : (editedVal as number);
            break;
          case 'is_active':
            payload[key] = editedVal as boolean;
            break;
          case 'variations':
            // Skip variations as they're handled separately
            break;
          default:
            // For any other fields, don't include them in the payload
            break;
        }
        hasChanges = true;
      }
    });

    // --- Validation on the payload ---
    if (payload.name !== undefined && !payload.name?.trim()) {
      setError('Name cannot be empty.');
      setIsSaving(false);
      return;
    }
    if (
      payload.price !== undefined &&
      (payload.price === null || isNaN(payload.price) || payload.price < 0)
    ) {
      setError('Invalid Price.');
      setIsSaving(false);
      return;
    }
    if (
      payload.strength !== undefined &&
      payload.strength !== null &&
      (isNaN(payload.strength) || payload.strength <= 0)
    ) {
      setError('Invalid Strength.');
      setIsSaving(false);
      return;
    }

    if (!hasChanges) {
      setIsEditing(false);
      setIsSaving(false);
      return;
    }

    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          router.push('/login');
          return;
        }
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to save changes');
      }
      const updatedProductData = await response.json();
      setProduct(updatedProductData as ProductDetails);
      setEditData(updatedProductData);
      setIsEditing(false);
      alert('Changes saved!');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to save changes.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle adding a new variation
  const handleAddVariation = () => {
    setCurrentVariation({
      product_id: product?.id,
      name: product?.name || '',
      price: product?.price || 0,
      inventory_quantity: 0,
      is_active: true,
    });
    setShowVariationModal(true);
  };

  // Handle editing an existing variation
  const handleEditVariation = (variationId: number) => {
    const variation = variations.find(v => v.id === variationId);
    if (variation) {
      setCurrentVariation({ ...variation });
      setShowVariationModal(true);
    }
  };

  // Handle saving a variation (create or update)
  const handleSaveVariation = async () => {
    if (!currentVariation || !product?.id || !token) return;

    setIsSavingVariation(true);
    setVariationError(null);

    try {
      // Validate required fields
      if (!currentVariation.name) {
        throw new Error('Variation name is required.');
      }

      if (currentVariation.price === undefined || currentVariation.price < 0) {
        throw new Error('Valid price is required.');
      }

      const isNewVariation = !currentVariation.id;
      const url = isNewVariation
        ? `/api/admin/products/${product.id}/variations`
        : `/api/admin/products/variations/${currentVariation.id}`;

      const response = await fetch(url, {
        method: isNewVariation ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currentVariation),
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          router.push('/login');
          return;
        }

        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to ${isNewVariation ? 'create' : 'update'} variation`
        );
      }

      // Reload variations after successful save
      await loadVariations();
      setShowVariationModal(false);
      setCurrentVariation(null);
    } catch (err: unknown) {
      const error = err as Error;
      setVariationError(error.message || 'Failed to save variation.');
      console.error(err);
    } finally {
      setIsSavingVariation(false);
    }
  };

  // Handle deleting a variation
  const handleDeleteVariation = async (variationId: number) => {
    if (!confirm(`Are you sure you want to delete this variation?`)) return;

    if (!token) return;

    try {
      const response = await fetch(`/api/admin/products/variations/${variationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          router.push('/login');
          return;
        }
        throw new Error(`Failed to delete variation (${response.status})`);
      }

      // Reload variations after successful delete
      await loadVariations();
    } catch (err: unknown) {
      const error = err as Error;
      setVariationError(error.message || 'Failed to delete variation.');
      console.error(err);
    }
  };

  // --- Render Logic ---
  if (authLoading || isLoadingData)
    return (
      <Layout>
        <div className="p-8">Loading...</div>
      </Layout>
    );
  if (!user || user.role !== 'Admin')
    return (
      <Layout>
        <div className="p-8">Access Denied.</div>
      </Layout>
    );
  if (error && !product)
    return (
      <Layout>
        <div className="p-8 text-red-500">Error: {error}</div>
      </Layout>
    );
  if (!product)
    return (
      <Layout>
        <div className="p-8">Product not found.</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
        <div className="mb-6">
          <Link href="/admin/dashboard/products" className="text-gold-400 hover:text-gold-300">
            &larr; Back to Products
          </Link>
        </div>
        <form onSubmit={handleSaveChanges}>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-100">
              {isEditing ? 'Edit Product' : 'Product Details'}: {product.name}
            </h1>
            <div className="space-x-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditData(product);
                      setIsEditing(false);
                      setError(null);
                    }}
                    className="rounded bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-600"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-500"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500"
                >
                  Edit Product
                </button>
              )}
            </div>
          </div>

          {error && <p className="mb-4 rounded bg-red-900/50 p-3 text-red-300">Error: {error}</p>}

          <div className="space-y-6 rounded-lg bg-gray-800 p-6 shadow-gold-sm">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Product Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={editData.name || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing || isSaving}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500 disabled:bg-gray-800"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    id="category"
                    value={editData.category || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing || isSaving}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500 disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-300">
                    Price* ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    value={editData.price || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing || isSaving}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500 disabled:bg-gray-800"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="compare_at_price"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Compare At Price ($)
                  </label>
                  <input
                    type="number"
                    name="compare_at_price"
                    id="compare_at_price"
                    value={editData.compare_at_price || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing || isSaving}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500 disabled:bg-gray-800"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    value={editData.description || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing || isSaving}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500 disabled:bg-gray-800"
                  />
                </div>

                <div>
                  <label htmlFor="strength" className="block text-sm font-medium text-gray-300">
                    Strength
                  </label>
                  <input
                    type="number"
                    name="strength"
                    id="strength"
                    value={editData.strength || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing || isSaving}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500 disabled:bg-gray-800"
                    min="0"
                    max="5"
                    step="1"
                  />
                  <p className="mt-1 text-sm text-gray-400">Strength level (0-5)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Product Image</label>
                  {isEditing ? (
                    token ? (
                      <ImageUploader
                        currentImageUrl={editData.image_url}
                        onImageUploadAction={url => setEditData({ ...editData, image_url: url })}
                        token={token}
                        folder="products"
                        disabled={isSaving}
                      />
                    ) : (
                      <div className="mt-1 text-sm text-red-400">
                        Authentication required for image upload
                      </div>
                    )
                  ) : (
                    <div className="mt-1">
                      {editData.image_url ? (
                        <div className="relative h-48 w-48 overflow-hidden rounded-md border border-gray-600">
                          <Image
                            src={editData.image_url}
                            alt={editData.name || 'Product image'}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex h-48 w-48 items-center justify-center rounded-md border-2 border-dashed border-gray-600 bg-gray-800">
                          <p className="text-sm text-gray-400">No image</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    checked={editData.is_active || false}
                    onChange={handleInputChange}
                    disabled={!isEditing || isSaving}
                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-gold-500 focus:ring-gold-500"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-300">
                    Active (visible to customers)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
        <div className="mt-8 rounded-lg bg-gray-800 p-6 shadow-gold-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-100">Product Variations</h2>
            <button
              type="button"
              onClick={handleAddVariation}
              className="rounded bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-500"
            >
              Add Variation
            </button>
          </div>

          {variationError && (
            <div className="mb-4 rounded bg-red-900/50 p-3 text-red-300">
              Error: {variationError}
            </div>
          )}

          {isLoadingVariations ? (
            <div className="py-4 text-center text-gray-300">Loading variations...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                    >
                      Flavor
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
                    >
                      Strength
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-300"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-300"
                    >
                      Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-300"
                    >
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-gray-800">
                  {variations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-400">
                        No variations found. Add your first variation!
                      </td>
                    </tr>
                  ) : (
                    variations.map(variation => (
                      <tr key={variation.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-200">
                          {variation.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-200">
                          {variation.flavor || '-'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                          {variation.strength || '-'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-200">
                          ${variation.price.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-400">
                          {variation.inventory_quantity}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              variation.is_active
                                ? 'bg-green-900/40 text-green-300'
                                : 'bg-red-900/40 text-red-300'
                            }`}
                          >
                            {variation.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                          <button
                            onClick={() => handleEditVariation(variation.id)}
                            className="mr-3 text-gold-400 hover:text-gold-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteVariation(variation.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Variation Modal */}
        {showVariationModal && currentVariation && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:h-screen sm:align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block transform overflow-hidden rounded-lg bg-gray-800 text-left align-bottom shadow-gold-sm transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                <div className="bg-gray-800 px-4 pb-4 pt-5 text-gray-200 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                      <h3 className="text-lg font-medium leading-6 text-gray-100">
                        {currentVariation.id ? 'Edit Variation' : 'Add Variation'}
                      </h3>

                      {variationError && (
                        <div className="mt-2 rounded bg-red-900/50 p-2 text-red-300">
                          {variationError}
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="variation-name"
                            className="block text-sm font-medium text-gray-300"
                          >
                            Name*
                          </label>
                          <input
                            type="text"
                            id="variation-name"
                            value={currentVariation.name || ''}
                            onChange={e =>
                              setCurrentVariation({ ...currentVariation, name: e.target.value })
                            }
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="variation-flavor"
                            className="block text-sm font-medium text-gray-300"
                          >
                            Flavor
                          </label>
                          <input
                            type="text"
                            id="variation-flavor"
                            value={currentVariation.flavor || ''}
                            onChange={e =>
                              setCurrentVariation({ ...currentVariation, flavor: e.target.value })
                            }
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="variation-strength"
                            className="block text-sm font-medium text-gray-300"
                          >
                            Strength
                          </label>
                          <input
                            type="number"
                            id="variation-strength"
                            value={currentVariation.strength || ''}
                            onChange={e =>
                              setCurrentVariation({
                                ...currentVariation,
                                strength: e.target.value ? parseInt(e.target.value) : null,
                              })
                            }
                            min="0"
                            max="5"
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="variation-price"
                            className="block text-sm font-medium text-gray-300"
                          >
                            Price* ($)
                          </label>
                          <input
                            type="number"
                            id="variation-price"
                            value={currentVariation.price || ''}
                            onChange={e =>
                              setCurrentVariation({
                                ...currentVariation,
                                price: e.target.value ? parseFloat(e.target.value) : 0,
                              })
                            }
                            step="0.01"
                            min="0"
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="variation-compare-price"
                            className="block text-sm font-medium text-gray-300"
                          >
                            Compare At Price ($)
                          </label>
                          <input
                            type="number"
                            id="variation-compare-price"
                            value={currentVariation.compare_at_price || ''}
                            onChange={e =>
                              setCurrentVariation({
                                ...currentVariation,
                                compare_at_price: e.target.value
                                  ? parseFloat(e.target.value)
                                  : null,
                              })
                            }
                            step="0.01"
                            min="0"
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="variation-sku"
                            className="block text-sm font-medium text-gray-300"
                          >
                            SKU
                          </label>
                          <input
                            type="text"
                            id="variation-sku"
                            value={currentVariation.sku || ''}
                            onChange={e =>
                              setCurrentVariation({ ...currentVariation, sku: e.target.value })
                            }
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="variation-inventory"
                            className="block text-sm font-medium text-gray-300"
                          >
                            Inventory Quantity
                          </label>
                          <input
                            type="number"
                            id="variation-inventory"
                            value={currentVariation.inventory_quantity || 0}
                            onChange={e =>
                              setCurrentVariation({
                                ...currentVariation,
                                inventory_quantity: parseInt(e.target.value),
                              })
                            }
                            min="0"
                            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-gold-500 focus:ring-gold-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300">
                            Product Image
                          </label>
                          {token ? (
                            <ImageUploader
                              currentImageUrl={currentVariation.image_url}
                              onImageUploadAction={url =>
                                setCurrentVariation({
                                  ...currentVariation,
                                  image_url: url,
                                })
                              }
                              token={token}
                              folder="variations"
                              disabled={isSavingVariation}
                              className="mt-1"
                            />
                          ) : (
                            <div className="mt-1 text-sm text-red-300">
                              Authentication required for image upload
                            </div>
                          )}
                        </div>

                        <div className="col-span-2 flex items-center">
                          <input
                            type="checkbox"
                            id="variation-active"
                            checked={currentVariation.is_active || false}
                            onChange={e =>
                              setCurrentVariation({
                                ...currentVariation,
                                is_active: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-gray-700 bg-gray-700 text-gold-500 focus:ring-gold-500"
                          />
                          <label
                            htmlFor="variation-active"
                            className="ml-2 block text-sm text-gray-300"
                          >
                            Active (visible to customers)
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    onClick={handleSaveVariation}
                    disabled={isSavingVariation}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isSavingVariation ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVariationModal(false);
                      setCurrentVariation(null);
                      setVariationError(null);
                    }}
                    disabled={isSavingVariation}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-base font-medium text-gray-300 shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

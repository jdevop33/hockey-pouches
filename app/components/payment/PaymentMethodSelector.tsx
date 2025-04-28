'use client';

import React from 'react';
import Image from 'next/image';

export type PaymentMethod = 'etransfer' | 'btc' | 'credit-card';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  error?: string | null;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-4">
      <div className="mb-2 text-lg font-medium text-gray-700">Payment Method</div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* E-Transfer Option */}
      <div
        className={`cursor-pointer rounded-lg border p-4 transition-colors ${
          selectedMethod === 'etransfer'
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 hover:bg-gray-50'
        }`}
        onClick={() => onChange('etransfer')}
      >
        <div className="flex items-center">
          <input
            type="radio"
            id="etransfer"
            name="paymentMethod"
            value="etransfer"
            checked={selectedMethod === 'etransfer'}
            onChange={() => onChange('etransfer')}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500"
          />
          <label
            htmlFor="etransfer"
            className="ml-3 flex cursor-pointer items-center text-sm font-medium text-gray-700"
          >
            <span className="mr-2">Interac e-Transfer</span>
            <div className="ml-1 flex items-center">
              <Image
                src="/images/logo/INTERAC_id-e-transfer-logo.png"
                alt="Interac e-Transfer"
                width={70}
                height={20}
                className="h-5 w-auto"
              />
            </div>
            <span className="ml-2 rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
              Recommended
            </span>
          </label>
        </div>

        {selectedMethod === 'etransfer' && (
          <div className="mt-3 pl-7">
            <p className="text-sm text-gray-700">
              After placing your order, you&apos;ll receive an email with instructions for sending
              an Interac e-Transfer. Your order will be processed once payment is confirmed.
            </p>
          </div>
        )}
      </div>

      {/* Bitcoin Option */}
      <div
        className={`cursor-pointer rounded-lg border p-4 transition-colors ${
          selectedMethod === 'btc'
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 hover:bg-gray-50'
        }`}
        onClick={() => onChange('btc')}
      >
        <div className="flex items-center">
          <input
            type="radio"
            id="btc"
            name="paymentMethod"
            value="btc"
            checked={selectedMethod === 'btc'}
            onChange={() => onChange('btc')}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500"
          />
          <label
            htmlFor="btc"
            className="ml-3 flex cursor-pointer items-center text-sm font-medium text-gray-700"
          >
            <span className="mr-2">Bitcoin</span>
            <Image
              src="/images/icons/bitcoin.svg"
              alt="Bitcoin"
              width={20}
              height={20}
              className="ml-1"
            />
          </label>
        </div>

        {selectedMethod === 'btc' && (
          <div className="mt-3 pl-7">
            <p className="text-sm text-gray-700">
              After placing your order, you&apos;ll receive an email with a Bitcoin address and the
              exact amount to send. Your order will be processed once the transaction is confirmed
              on the blockchain.
            </p>
          </div>
        )}
      </div>

      {/* Credit Card Option */}
      <div
        className={`cursor-pointer rounded-lg border p-4 transition-colors ${
          selectedMethod === 'credit-card'
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 hover:bg-gray-50'
        }`}
        onClick={() => onChange('credit-card')}
      >
        <div className="flex items-center">
          <input
            type="radio"
            id="credit-card"
            name="paymentMethod"
            value="credit-card"
            checked={selectedMethod === 'credit-card'}
            onChange={() => onChange('credit-card')}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500"
          />
          <label
            htmlFor="credit-card"
            className="ml-3 flex cursor-pointer items-center text-sm font-medium text-gray-700"
          >
            <span className="mr-2">Credit Card</span>
            <div className="ml-2 flex items-center space-x-1">
              <Image
                src="/images/icons/visa.svg"
                alt="Visa"
                width={28}
                height={20}
                className="h-5 w-auto"
              />
              <Image
                src="/images/icons/mastercard.svg"
                alt="Mastercard"
                width={28}
                height={20}
                className="h-5 w-auto"
              />
              <Image
                src="/images/icons/amex.svg"
                alt="American Express"
                width={28}
                height={20}
                className="h-5 w-auto"
              />
            </div>
          </label>
        </div>

        {selectedMethod === 'credit-card' && (
          <div className="mt-3 pl-7">
            <p className="text-sm text-gray-700">
              After placing your order, you&apos;ll be redirected to our secure payment processor to
              complete your payment. Your order will be processed immediately upon successful
              payment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;

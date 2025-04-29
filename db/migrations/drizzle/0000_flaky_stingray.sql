CREATE TYPE "public"."commission_status" AS ENUM('Pending', 'Payable', 'Paid', 'Cancelled');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed_amount');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('Created', 'PendingPayment', 'PaymentReceived', 'Processing', 'ReadyForFulfillment', 'Fulfilled', 'Shipped', 'Delivered', 'Completed', 'Cancelled', 'Refunded');--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('Retail', 'Wholesale');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('CreditCard', 'ETransfer', 'Bitcoin', 'Manual');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('Pending', 'Completed', 'Failed', 'Refunded');--> statement-breakpoint
CREATE TYPE "public"."task_category" AS ENUM('OrderReview', 'Fulfillment', 'Payout', 'UserManagement', 'Other');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('Low', 'Medium', 'High', 'Urgent');--> statement-breakpoint
CREATE TYPE "public"."task_related_entity" AS ENUM('Order', 'User', 'Payment', 'Fulfillment', 'PayoutBatch', 'Commission');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('Pending', 'InProgress', 'Completed', 'Cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('Admin', 'Customer', 'Distributor', 'Wholesale Buyer', 'Retail Referrer');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('Active', 'Inactive', 'Suspended', 'Pending');--> statement-breakpoint
CREATE TYPE "public"."wholesale_application_status" AS ENUM('Pending', 'Approved', 'Rejected');--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"product_variation_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"order_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"rate" numeric(5, 2) NOT NULL,
	"status" "commission_status" DEFAULT 'Pending' NOT NULL,
	"payment_date" timestamp with time zone,
	"payment_reference" varchar(255),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "discount_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"discount_type" "discount_type" NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"min_order_amount" numeric(10, 2) DEFAULT '0.00',
	"max_discount_amount" numeric(10, 2),
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"usage_limit" integer,
	"times_used" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "discount_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "stock_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" integer NOT NULL,
	"product_variation_id" integer,
	"location_id" uuid NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"reserved_quantity" integer DEFAULT 0 NOT NULL,
	"reorder_point" integer,
	"reorder_quantity" integer,
	"last_recount_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"type" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" integer NOT NULL,
	"product_variation_id" integer,
	"location_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"reference_id" varchar(255),
	"reference_type" varchar(50),
	"notes" text,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" varchar(100) NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"related_entity_id" text,
	"related_entity_type" varchar(50),
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_fulfillments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"tracking_number" varchar(255),
	"carrier" varchar(100),
	"notes" text,
	"fulfillment_proof_url" jsonb,
	"status" varchar(50) DEFAULT 'Pending Approval',
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"review_notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_variation_id" integer NOT NULL,
	"price_at_purchase" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"status" "order_status" NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"status" "order_status" DEFAULT 'PendingPayment' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"distributor_id" text,
	"commission_amount" numeric(10, 2),
	"payment_method" "payment_method" NOT NULL,
	"payment_status" "payment_status" DEFAULT 'Pending' NOT NULL,
	"type" "order_type" NOT NULL,
	"shipping_address" jsonb NOT NULL,
	"notes" text,
	"discount_code" varchar(50),
	"discount_amount" numeric(10, 2) DEFAULT '0.00',
	"applied_referral_code" varchar(10),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'Pending' NOT NULL,
	"transaction_id" varchar(255),
	"reference_number" varchar(255),
	"payment_details" jsonb,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_pricing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"product_variation_id" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_variations" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"flavor" varchar(100),
	"strength" integer,
	"price" numeric(10, 2) NOT NULL,
	"compare_at_price" numeric(10, 2),
	"sku" varchar(100),
	"image_url" varchar(255),
	"inventory_quantity" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" text,
	"flavor" varchar(100),
	"strength" integer,
	"price" numeric(10, 2) NOT NULL,
	"compare_at_price" numeric(10, 2),
	"image_url" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'Pending' NOT NULL,
	"priority" "task_priority" DEFAULT 'Medium' NOT NULL,
	"category" "task_category" NOT NULL,
	"related_to" "task_related_entity",
	"related_id" text,
	"assigned_to" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'Customer' NOT NULL,
	"status" varchar(50) DEFAULT 'Active' NOT NULL,
	"referral_code" varchar(10),
	"referred_by" text,
	"commission_rate" numeric(5, 2),
	"commission_balance" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"is_consignment_allowed" boolean DEFAULT false NOT NULL,
	"outstanding_debt" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"wholesale_eligibility" boolean DEFAULT false NOT NULL,
	"wholesale_approved_at" timestamp with time zone,
	"wholesale_approved_by" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "wholesale_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"company_name" text NOT NULL,
	"tax_id" text NOT NULL,
	"business_type" text NOT NULL,
	"address" jsonb NOT NULL,
	"phone" text NOT NULL,
	"website" text,
	"notes" text,
	"status" "wholesale_application_status" DEFAULT 'Pending' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now(),
	"reviewed_at" timestamp with time zone,
	"reviewed_by" text,
	"reviewer_notes" text,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wholesale_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"min_order_quantity" integer DEFAULT 100 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_variation_id_product_variations_id_fk" FOREIGN KEY ("product_variation_id") REFERENCES "public"."product_variations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_product_variation_id_product_variations_id_fk" FOREIGN KEY ("product_variation_id") REFERENCES "public"."product_variations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_location_id_stock_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."stock_locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_variation_id_product_variations_id_fk" FOREIGN KEY ("product_variation_id") REFERENCES "public"."product_variations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_location_id_stock_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."stock_locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_fulfillments" ADD CONSTRAINT "order_fulfillments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_fulfillments" ADD CONSTRAINT "order_fulfillments_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_variation_id_product_variations_id_fk" FOREIGN KEY ("product_variation_id") REFERENCES "public"."product_variations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_distributor_id_users_id_fk" FOREIGN KEY ("distributor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_pricing" ADD CONSTRAINT "custom_pricing_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_pricing" ADD CONSTRAINT "custom_pricing_product_variation_id_product_variations_id_fk" FOREIGN KEY ("product_variation_id") REFERENCES "public"."product_variations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variations" ADD CONSTRAINT "product_variations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_users_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_wholesale_approved_by_users_id_fk" FOREIGN KEY ("wholesale_approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wholesale_applications" ADD CONSTRAINT "wholesale_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wholesale_applications" ADD CONSTRAINT "wholesale_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_user_variation_idx" ON "cart_items" USING btree ("user_id","product_variation_id");--> statement-breakpoint
CREATE INDEX "cart_items_user_id_idx" ON "cart_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "commissions_user_id_idx" ON "commissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "commissions_order_id_idx" ON "commissions" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "commissions_status_idx" ON "commissions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "discount_codes_code_idx" ON "discount_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "discount_codes_active_start_date_idx" ON "discount_codes" USING btree ("is_active","start_date");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_levels_product_id_product_variation_id_location_id_key" ON "stock_levels" USING btree ("product_variation_id","location_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_read_idx" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "notifications_related_entity_idx" ON "notifications" USING btree ("related_entity_type","related_entity_id");--> statement-breakpoint
CREATE INDEX "order_fulfillments_order_id_idx" ON "order_fulfillments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_fulfillments_status_idx" ON "order_fulfillments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_product_variation_id_idx" ON "order_items" USING btree ("product_variation_id");--> statement-breakpoint
CREATE INDEX "order_status_history_order_id_idx" ON "order_status_history" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_status_history_created_at_idx" ON "order_status_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "orders_user_id_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_distributor_id_idx" ON "orders" USING btree ("distributor_id");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "orders_applied_referral_code_idx" ON "orders" USING btree ("applied_referral_code");--> statement-breakpoint
CREATE INDEX "idx_payments_order_id" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payments_transaction_id" ON "payments" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "idx_payments_reference_number" ON "payments" USING btree ("reference_number");--> statement-breakpoint
CREATE UNIQUE INDEX "custom_pricing_user_variation_idx" ON "custom_pricing" USING btree ("user_id","product_variation_id");--> statement-breakpoint
CREATE INDEX "idx_product_variations_product_id" ON "product_variations" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_product_variations_is_active" ON "product_variations" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variations_product_id_flavor_strength_key" ON "product_variations" USING btree ("product_id","flavor","strength");--> statement-breakpoint
CREATE INDEX "products_is_active_idx" ON "products" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "products_price_idx" ON "products" USING btree ("price");--> statement-breakpoint
CREATE INDEX "idx_tasks_status" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tasks_category" ON "tasks" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_tasks_related_to_id" ON "tasks" USING btree ("related_to","related_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_assigned_to" ON "tasks" USING btree ("assigned_to");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_referral_code_idx" ON "users" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "users_referred_by_idx" ON "users" USING btree ("referred_by");--> statement-breakpoint
CREATE INDEX "users_wholesale_approved_by_idx" ON "users" USING btree ("wholesale_approved_by");--> statement-breakpoint
CREATE INDEX "wholesale_applications_user_id_idx" ON "wholesale_applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wholesale_applications_status_idx" ON "wholesale_applications" USING btree ("status");
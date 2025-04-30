CREATE TYPE "public"."commission_related_entity" AS ENUM('Order');--> statement-breakpoint
CREATE TYPE "public"."commission_type" AS ENUM('OrderReferral', 'Fulfillment');--> statement-breakpoint
CREATE TYPE "public"."stock_location_type" AS ENUM('Warehouse', 'DistributionCenter', 'RetailStore');--> statement-breakpoint
CREATE TYPE "public"."stock_movement_type" AS ENUM('Sale', 'Return', 'Restock', 'Adjustment', 'TransferOut', 'TransferIn', 'Initial');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_status" AS ENUM('Pending', 'Approved', 'Rejected');--> statement-breakpoint
CREATE TABLE "token_blacklist" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"user_id" text,
	"reason" text
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_referred_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_wholesale_approved_by_users_id_fk";
--> statement-breakpoint
DROP INDEX "stock_levels_product_id_product_variation_id_location_id_key";--> statement-breakpoint
ALTER TABLE "stock_locations" ALTER COLUMN "type" SET DATA TYPE "public"."stock_location_type" USING "type"::"public"."stock_location_type";--> statement-breakpoint
ALTER TABLE "stock_movements" ALTER COLUMN "type" SET DATA TYPE "public"."stock_movement_type" USING "type"::"public"."stock_movement_type";--> statement-breakpoint
ALTER TABLE "order_fulfillments" ALTER COLUMN "status" SET DEFAULT 'Pending'::"public"."fulfillment_status";--> statement-breakpoint
ALTER TABLE "order_fulfillments" ALTER COLUMN "status" SET DATA TYPE "public"."fulfillment_status" USING "status"::"public"."fulfillment_status";--> statement-breakpoint
ALTER TABLE "order_fulfillments" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "commissions" ADD COLUMN "type" "commission_type" DEFAULT 'OrderReferral' NOT NULL;--> statement-breakpoint
ALTER TABLE "commissions" ADD COLUMN "related_to" "commission_related_entity";--> statement-breakpoint
ALTER TABLE "commissions" ADD COLUMN "related_id" text;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD COLUMN "payment_status" "payment_status";--> statement-breakpoint
ALTER TABLE "order_status_history" ADD COLUMN "changed_by_user_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "billing_address" jsonb;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_user_id_users_id_fk" FOREIGN KEY ("changed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "commissions_type_idx" ON "commissions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "commissions_related_entity_idx" ON "commissions" USING btree ("related_to","related_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_levels_product_variation_id_location_id_key" ON "stock_levels" USING btree ("product_variation_id","location_id");
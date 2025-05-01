CREATE TABLE "referrals" (
	"id" text PRIMARY KEY NOT NULL,
	"referrer_id" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" text,
	"referred_user_id" text,
	"referral_code" varchar(10) NOT NULL,
	"referral_url" text,
	"status" varchar(20) DEFAULT 'Pending' NOT NULL,
	"invitation_sent" boolean DEFAULT false NOT NULL,
	"invitation_sent_at" timestamp with time zone,
	"registered_at" timestamp with time zone,
	"converted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_user_id_users_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "referrals_referrer_id_idx" ON "referrals" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "referrals_email_idx" ON "referrals" USING btree ("email");--> statement-breakpoint
CREATE INDEX "referrals_referred_user_id_idx" ON "referrals" USING btree ("referred_user_id");--> statement-breakpoint
CREATE INDEX "referrals_status_idx" ON "referrals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "referrals_created_at_idx" ON "referrals" USING btree ("created_at");
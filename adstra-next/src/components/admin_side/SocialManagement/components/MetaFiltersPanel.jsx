"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { ArrowLeft, X, ChevronDown, ChevronUp, Check, Search } from "lucide-react";

/**
 * Exact Recent Searches matching Meta Ads Manager (Images 1, 2, 3, 4)
 */
export const EXACT_RECENT_SEARCHES = [
  {
    id: "impr_gt_0",
    label: "Impressions (Campaign) > 0",
    value: "Impressions (Campaign) > 0",
    render: () => <span>Impressions (Campaign) &gt; 0</span>,
  },
  {
    id: "obj_sales",
    label: "Objective is Sales",
    value: "Objective is Sales",
    render: () => (
      <span>
        Objective <span style={{ color: "#65676b" }}>is</span> <strong style={{ fontWeight: 600 }}>Sales</strong>
      </span>
    ),
  },
  {
    id: "deliv_active",
    label: "Campaign delivery is Active",
    value: "Campaign delivery is Active",
    render: () => (
      <span>
        Campaign delivery <span style={{ color: "#65676b" }}>is</span>{" "}
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#31a24c",
            margin: "0 4px 1px 2px",
            verticalAlign: "middle",
          }}
        />{" "}
        <strong style={{ fontWeight: 600 }}>Active</strong>
      </span>
    ),
  },
  {
    id: "name_njm",
    label: "Campaign name contains all of njm",
    value: "Campaign name contains all of njm",
    render: () => (
      <span>
        Campaign name <span style={{ color: "#65676b" }}>contains all of</span> <strong style={{ fontWeight: 600 }}>njm</strong>
      </span>
    ),
  },
  {
    id: "obj_app",
    label: "Objective is App promotion",
    value: "Objective is App promotion",
    render: () => (
      <span>
        Objective <span style={{ color: "#65676b" }}>is</span> <strong style={{ fontWeight: 600 }}>App promotion</strong>
      </span>
    ),
  },
  {
    id: "deliv_pending",
    label: "Campaign delivery is Pending",
    value: "Campaign delivery is Pending",
    render: () => (
      <span>
        Campaign delivery <span style={{ color: "#65676b" }}>is</span>{" "}
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            border: "1.8px solid #31a24c",
            background: "#ffffff",
            margin: "0 4px 1px 2px",
            verticalAlign: "middle",
            boxSizing: "border-box",
          }}
        />{" "}
        <strong style={{ fontWeight: 600 }}>Pending</strong>
      </span>
    ),
  },
];

/**
 * Meta Filter Categories with full comprehensive metric fields
 */
export const EXACT_FILTER_CATEGORIES = [
  {
    id: "performance",
    name: "Performance",
    isExpandable: true,
    subItems: [
      { id: "p_results", label: "Results" },
      { id: "p_reach", label: "Reach" },
      { id: "p_freq", label: "Frequency" },
      { id: "p_impr", label: "Impressions" },
      { id: "p_views", label: "Views" },
      { id: "p_viewers", label: "Viewers" },
      { id: "p_amount_spent", label: "Amount spent" },
      { id: "p_clicks_all", label: "Clicks (all)" },
      { id: "p_cpc_all", label: "CPC (all)" },
      { id: "p_ctr_all", label: "CTR (all)" },
      {
        id: "p_gross_impr",
        label: "Gross impressions (includes invalid impressions from non-human traffic)",
      },
      { id: "p_auto_refresh_impr", label: "Auto-refresh impressions" },
      {
        id: "p_avg_purch_conv_val",
        label: "Average purchases conversion value",
      },
      { id: "p_results_value", label: "Results value" },
      { id: "p_results_roas", label: "Results ROAS" },
      { id: "p_cost_per_result", label: "Cost per result" },
      {
        id: "p_cost_per_1000_meta_reach",
        label: "Cost per 1,000 Meta accounts reached",
      },
      {
        id: "p_cpm",
        label: "CPM (cost per 1,000 impressions)",
      },
      {
        id: "p_results_rate_link_clicks",
        label: "Results rate per link clicks",
      },
      {
        id: "p_purch_rate_lp_views",
        label: "Purchases rate per landing page views",
      },
      {
        id: "p_purch_rate_link_clicks",
        label: "Purchases rate per link clicks",
      },
      {
        id: "p_lp_views_rate_link_clicks",
        label: "Landing page views rate per link clicks",
      },
    ],
  },
  {
    id: "engagement",
    name: "Engagement",
    isExpandable: true,
    subItems: [
      { id: "e_fb_likes", label: "Facebook likes" },
      { id: "e_ig_follows", label: "Instagram follows" },
      { id: "e_join_group_req", label: "Join group requests" },
      { id: "e_post_comments", label: "Post comments" },
      { id: "e_post_engagements", label: "Post engagements" },
      { id: "e_post_reactions", label: "Post reactions" },
      { id: "e_post_shares", label: "Post shares" },
      { id: "e_photo_clicks", label: "Photo clicks" },
      { id: "e_event_responses", label: "Event responses" },
      { id: "e_check_ins", label: "Check-ins" },
      { id: "e_cost_per_page_eng", label: "Cost per Page engagement" },
      { id: "e_cost_per_like", label: "Cost per like" },
      { id: "e_cost_per_join_group_req", label: "Cost per join group request" },
      { id: "e_cost_per_post_eng", label: "Cost per post engagement" },
      { id: "e_cost_per_event_resp", label: "Cost per event response" },
      { id: "e_new_msg_contacts", label: "New messaging contacts" },
      { id: "e_welcome_msg_views", label: "Welcome message views" },
      { id: "e_msg_conv_replied", label: "Messaging conversations replied" },
      { id: "e_cost_per_new_msg_contact", label: "Cost per new messaging contact" },
      { id: "e_cost_per_msg_sub", label: "Cost per messaging subscription" },
      { id: "e_phone_calls_placed", label: "Phone calls placed" },
      { id: "e_callback_req_submitted", label: "Callback requests submitted" },
      { id: "e_uniq_2s_cont_vid_plays", label: "Unique 2-second continuous video plays" },
      { id: "e_2s_cont_vid_plays", label: "2-second continuous video plays" },
      { id: "e_3s_vid_plays", label: "3-second video plays" },
      { id: "e_ix_view_time", label: "Instant Experience view time" },
      { id: "e_ix_view_percentage", label: "Instant Experience view percentage" },
      { id: "e_cost_per_2s_cont_vid_play", label: "Cost per 2-second continuous video play" },
      { id: "e_cost_per_3s_vid_play", label: "Cost per 3-second video play" },
      { id: "e_cost_per_thruplay", label: "Cost per ThruPlay" },
      { id: "e_link_clicks", label: "Link clicks" },
      { id: "e_shop_clicks", label: "Shop clicks" },
      { id: "e_prompts_resp_clicks", label: "Prompts and responses clicks" },
      { id: "e_uniq_link_clicks", label: "Unique link clicks" },
      { id: "e_outbound_clicks", label: "Outbound clicks" },
      { id: "e_uniq_outbound_clicks", label: "Unique outbound clicks" },
      { id: "e_uniq_ctr_link", label: "Unique CTR (link click-through rate)" },
      { id: "e_outbound_ctr", label: "Outbound CTR (click-through rate)" },
      { id: "e_uniq_clicks_all", label: "Unique clicks (all)" },
      { id: "e_uniq_ctr_all", label: "Unique CTR (all)" },
      { id: "e_ix_clicks_to_open", label: "Instant Experience clicks to open" },
      { id: "e_ix_clicks_to_start", label: "Instant Experience clicks to start" },
      { id: "e_ix_outbound_clicks", label: "Instant Experience outbound clicks" },
      { id: "e_net_reminders_on", label: "Net reminders on" },
      { id: "e_ig_profile_visits", label: "Instagram profile visits" },
      { id: "e_cpc_link_click", label: "CPC (cost per link click)" },
      { id: "e_cost_per_uniq_link_click", label: "Cost per unique link click" },
      { id: "e_cost_per_outbound_click", label: "Cost per outbound click" },
      { id: "e_cost_per_uniq_outbound_click", label: "Cost per unique outbound click" },
      { id: "e_cost_per_uniq_click_all", label: "Cost per unique click (all)" },
      { id: "e_est_ad_recall_lift_people", label: "Estimated ad recall lift (people)" },
      { id: "e_est_ad_recall_lift_rate", label: "Estimated ad recall lift rate" },
      { id: "e_cost_per_ad_recall_lift", label: "Cost per ad recall lift" },
    ],
  },
  {
    id: "conversions",
    name: "Conversions",
    isExpandable: true,
    subItems: [
      { id: "c_achieve_unlocked", label: "Achievements unlocked" },
      { id: "c_cost_per_achieve_unlocked", label: "Cost per achievement unlocked" },
      { id: "c_achieve_unlocked_val", label: "Achievements unlocked conversion value" },
      { id: "c_adds_pay_info", label: "Adds of payment info" },
      { id: "c_cost_per_add_pay_info", label: "Cost per add of payment info" },
      { id: "c_adds_pay_info_val", label: "Adds of payment info conversion value" },
      { id: "c_adds_cart_val", label: "Adds to cart conversion value" },
      { id: "c_adds_wishlist", label: "Adds to wishlist" },
      { id: "c_cost_per_add_wishlist", label: "Cost per add to wishlist" },
      { id: "c_adds_wishlist_val", label: "Adds to wishlist conversion value" },
      { id: "c_app_activations", label: "App activiations" },
      { id: "c_cost_per_app_activation", label: "Cost per app activation" },
      { id: "c_app_activations_val", label: "App activations conversion value" },
      { id: "c_cost_per_app_install", label: "Cost per app install" },
      { id: "c_cost_per_checkout_init", label: "Cost per checkout initiated" },
      { id: "c_checkout_init_val", label: "Checkouts initiated conversion value" },
      { id: "c_content_views", label: "Content views" },
      { id: "c_cost_per_content_view", label: "Cost per content view" },
      { id: "c_content_views_val", label: "Content views conversion value" },
      { id: "c_credit_spends", label: "Credit spends" },
      { id: "c_cost_per_credit_spend", label: "Cost per credit spend" },
      { id: "c_credit_spends_val", label: "Credit spends conversion value" },
      { id: "c_custom_events", label: "Custom events" },
      { id: "c_cost_per_custom_event", label: "Cost per custom event" },
      { id: "c_desktop_app_eng", label: "Desktop app engagements" },
      { id: "c_cost_per_desktop_app_eng", label: "Cost per desktop app engagement" },
      { id: "c_desktop_app_story_eng", label: "Desktop app story engagements" },
      { id: "c_cost_per_desktop_app_story_eng", label: "Cost per desktop app story engagement" },
      { id: "c_desktop_app_uses", label: "Desktop app uses" },
      { id: "c_cost_per_desktop_app_use", label: "Cost per desktop app use" },
      { id: "c_direct_web_purch", label: "Direct website purchases" },
      { id: "c_direct_web_purch_val", label: "Direct website purchases conversion value" },
      { id: "c_cost_per_game_play", label: "Cost per game play" },
      { id: "c_inapp_ad_impr_val", label: "In-app ad impressions value" },
      { id: "c_landing_page_views", label: "Landing page views" },
      { id: "c_cost_per_lp_view", label: "Cost per landing page view" },
      { id: "c_leads_val", label: "Leads conversion value" },
      { id: "c_levels_achieved", label: "Levels achieved" },
      { id: "c_cost_per_level_achieved", label: "Cost per level achieved" },
      { id: "c_levels_achieved_val", label: "Levels achieved conversion value" },
      { id: "c_cost_per_meta_workflow_comp", label: "Cost per Meta workflow completion" },
      { id: "c_meta_workflow_comp_val", label: "Meta workflow completions value" },
      { id: "c_cost_per_mobile_d2_ret", label: "Cost per mobile app D2 retention" },
      { id: "c_cost_per_mobile_d7_ret", label: "Cost per mobile app D7 retention" },
      { id: "c_meta_msg_to_buy", label: "Meta message to buy" },
      { id: "c_cost_per_meta_msg_to_buy", label: "Cost per Meta message to buy" },
      { id: "c_orders_created", label: "Orders created" },
      { id: "c_other_offline_conv", label: "Other offline conversions" },
      { id: "c_cost_per_other_offline_conv", label: "Cost per other offline conversion" },
      { id: "c_other_offline_conv_val", label: "Other offline conversion value" },
      { id: "c_purchase_roas", label: "Purchase ROAS (return on ad spend)" },
      { id: "c_purchases", label: "Purchases" },
      { id: "c_purchases_val", label: "Purchases conversion value" },
      { id: "c_ratings_submitted", label: "Ratings submitted" },
      { id: "c_cost_per_rating_submitted", label: "Cost per rating submitted" },
      { id: "c_ratings_submitted_val", label: "Ratings submitted conversion value" },
      { id: "c_cost_per_reg_completed", label: "Cost per registration completed" },
      { id: "c_reg_completed_val", label: "Registrations completed conversion value" },
      { id: "c_searches", label: "Searches" },
      { id: "c_cost_per_search", label: "Cost per search" },
      { id: "c_searches_val", label: "Searches conversion value" },
      { id: "c_shops_assisted_purch", label: "Shops-assisted purchases" },
      { id: "c_shops_assisted_purch_val", label: "Shops-assisted purchases conversion value" },
      { id: "c_tutorials_completed", label: "Tutorials completed" },
      { id: "c_cost_per_tutorial_completed", label: "Cost per tutorial completed" },
      { id: "c_tutorials_completed_val", label: "Tutorials completed conversion value" },
      { id: "c_inapp_achieve_unlocked", label: "In-app achievements unlocked" },
      { id: "c_inapp_achieve_unlocked_val", label: "In-app achievements unlocked conversion value" },
      { id: "c_inapp_adds_pay_info", label: "In-app adds of payment info" },
      { id: "c_web_adds_pay_info", label: "Website adds of payment info" },
      { id: "c_offline_adds_pay_info", label: "Offline adds of payment info" },
      { id: "c_inapp_adds_pay_info_val", label: "In-app adds of payment info conversion value" },
      { id: "c_web_pay_info_adds_val", label: "Website payment info adds conversion value" },
      { id: "c_offline_pay_info_adds_val", label: "Offline payment info adds conversion value" },
      { id: "c_inapp_adds_cart", label: "In-app adds to cart" },
      { id: "c_web_adds_cart", label: "Website adds to cart" },
      { id: "c_offline_adds_cart", label: "Offline adds to cart" },
      { id: "c_meta_adds_cart", label: "Meta adds to cart" },
      { id: "c_inapp_adds_cart_val", label: "In-app adds to cart conversion value" },
      { id: "c_web_adds_cart_val", label: "Website adds to cart conversion value" },
      { id: "c_offline_adds_cart_val", label: "Offline adds to cart conversion value" },
      { id: "c_inapp_adds_wishlist", label: "In-app adds to wishlist" },
      { id: "c_web_adds_wishlist", label: "Website adds to wishlist" },
      { id: "c_offline_adds_wishlist", label: "Offline adds to wishlist" },
      { id: "c_inapp_adds_wishlist_val", label: "In-app adds to wishlist conversion value" },
      { id: "c_web_adds_wishlist_val", label: "Website adds to wishlist conversion value" },
      { id: "c_offline_adds_wishlist_val", label: "Offline adds to wishlist conversion value" },
      { id: "c_meta_adds_wishlist_val", label: "Meta adds to wishlist conversion value" },
      { id: "c_inapp_sessions", label: "In-app sessions" },
      { id: "c_inapp_sessions_val", label: "In-app sessions conversion value" },
      { id: "c_mobile_app_installs", label: "Mobile app installs" },
      { id: "c_desktop_app_installs", label: "Desktop app installs" },
      { id: "c_inapp_checkouts_init", label: "In-app checkouts initiated" },
      { id: "c_web_checkouts_init", label: "Website checkouts initiated" },
      { id: "c_offline_checkouts_init", label: "Offline checkouts initiated" },
      { id: "c_inapp_checkouts_init_val", label: "In-app checkouts initiated conversion value" },
      { id: "c_web_checkouts_init_val", label: "Website checkouts initiated conversion value" },
      { id: "c_offline_checkouts_init_val", label: "Offline checkouts initiated conversion value" },
      { id: "c_inapp_content_views", label: "In-app content views" },
      { id: "c_web_content_views", label: "Website content views" },
      { id: "c_offline_content_views", label: "Offline content views" },
      { id: "c_meta_content_views", label: "Meta content views" },
      { id: "c_inapp_content_views_val", label: "In-app content views conversion value" },
      { id: "c_web_content_views_val", label: "Website content views conversion value" },
      { id: "c_offline_content_views_val", label: "Offline content views conversion value" },
      { id: "c_inapp_credits_spent", label: "In-app credits spent" },
      { id: "c_desktop_credits_spent", label: "Desktop app credit spends" },
      { id: "c_inapp_credits_spent_val", label: "In-app credits spent conversion value" },
      { id: "c_desktop_credits_spent_val", label: "Desktop credit spends conversion value" },
      { id: "c_app_lp_views", label: "App landing page views" },
      { id: "c_web_lp_views", label: "Website landing page views" },
      { id: "c_web_leads", label: "Website leads" },
      { id: "c_offline_leads", label: "Offline leads" },
      { id: "c_web_leads_val", label: "Website leads conversion value" },
      { id: "c_offline_leads_val", label: "Offline leads conversion value" },
      { id: "c_meta_leads_val", label: "Meta leads conversion value" },
      { id: "c_inapp_levels_achieved", label: "In-app levels achieved" },
      { id: "c_inapp_levels_achieved_val", label: "In-app levels achieved conversion value" },
      { id: "c_web_purchase_roas", label: "Website purchase ROAS (return on ad spend)" },
      { id: "c_inapp_purchase_roas", label: "In-app purchase ROAS (return on ad spend)" },
      { id: "c_inapp_purchases", label: "In-app purchases" },
      { id: "c_web_purchases", label: "Website purchases" },
      { id: "c_offline_purchases", label: "Offline purchases" },
      { id: "c_meta_purchases", label: "Meta purchases" },
      { id: "c_inapp_purchases_val", label: "In-app purchases conversion value" },
      { id: "c_web_purchases_val", label: "Website purchases conversion value" },
      { id: "c_offline_purchases_val", label: "Offline purchases conversion value" },
      { id: "c_meta_purchases_val", label: "Meta purchase conversion value" },
      { id: "c_inapp_ratings_submitted", label: "In-app ratings submitted" },
      { id: "c_inapp_ratings_submitted_val", label: "In-app ratings submitted conversion value" },
      { id: "c_inapp_reg_completed", label: "In-app registrations completed" },
      { id: "c_web_reg_completed", label: "Website registrations completed" },
      { id: "c_offline_reg_completed", label: "Offline registrations completed" },
      { id: "c_inapp_reg_completed_val", label: "In-app registrations completed conversion value" },
      { id: "c_web_reg_completed_val", label: "Website registrations completed conversion value" },
      { id: "c_offline_reg_completed_val", label: "Offline registrations completed conversion value" },
      { id: "c_inapp_searches", label: "In-app searches" },
      { id: "c_web_searches", label: "Website searches" },
      { id: "c_offline_searches", label: "Offline searches" },
      { id: "c_inapp_searches_val", label: "In-app searches conversion value" },
      { id: "c_web_searches_val", label: "Website searches conversion value" },
      { id: "c_offline_searches_val", label: "Offline searches conversion value" },
      { id: "c_inapp_tutorials_completed", label: "In-app tutorials completed" },
      { id: "c_inapp_tutorials_completed_val", label: "In-app tutorials completed conversion value" },
    ],
  },
];

/**
 * Filter items matching Meta Ads Manager Filters section
 */
export const EXACT_FILTER_ITEMS = [
  { id: "item_name", name: "name", type: "name" },
  { id: "item_id", name: "ID", type: "id" },
  { id: "objectives", name: "Objectives", type: "objectives" },
  { id: "item_delivery", name: "delivery", type: "delivery" },
  { id: "campaign_setup", name: "Campaign setup", type: "campaign_setup" },
  { id: "performance_goal", name: "Performance goal", type: "performance_goal" },
  { id: "ad_changed", name: "Ad changed", type: "ad_changed" },
  { id: "conversion_location", name: "Conversion location", type: "conversion_location" },
  { id: "catalogue", name: "Catalogue", type: "catalogue" },
  { id: "placement", name: "Placement", type: "placement" },
  {
    id: "audience",
    name: "Audience",
    isExpandable: true,
    subItems: [
      { id: "aud_custom", label: "Custom audience" },
      { id: "aud_lookalike", label: "Lookalike audience" },
      { id: "aud_location", label: "Location" },
      { id: "aud_age", label: "Age" },
      { id: "aud_gender", label: "Gender" },
    ],
  },
  { id: "attribution_setting", name: "Attribution setting", type: "attribution_setting" },
  { id: "special_ad_category", name: "Special ad category", type: "special_ad_category" },
  { id: "test_name", name: "Test name", type: "test_name" },
  { id: "campaign_tag", name: "Campaign Tag", type: "campaign_tag" },
];

/**
 * See More Filter Items (Meta Ads Manager Advanced Filters)
 */
export const EXACT_SEE_MORE_ITEMS = [
  { id: "buying_type", name: "Buying type", type: "buying_type" },
  { id: "optimization_goal", name: "Optimization goal", type: "optimization_goal" },
  { id: "budget_type", name: "Budget type", type: "budget_type" },
  { id: "bid_strategy", name: "Bid strategy", type: "bid_strategy" },
  { id: "event_type", name: "Event type", type: "event_type" },
  { id: "targeting_expansion", name: "Targeting expansion", type: "targeting_expansion" },
  { id: "split_test", name: "Split test", type: "split_test" },
];

export const METRIC_COMPARISON_OPERATORS = [
  { value: "is greater than", label: "is greater than", symbol: ">" },
  { value: "is smaller than", label: "is smaller than", symbol: "<" },
  { value: "is at least", label: "is at least", symbol: ">=" },
  { value: "is at most", label: "is at most", symbol: "<=" },
  { value: "is", label: "is", symbol: "=" },
];

export const METRIC_CATEGORY_IDS = new Set(["performance", "engagement", "conversions"]);

export const EXCLUDED_METRIC_IDS = new Set([
  "p_viewers",
  "p_purch_rate_lp_views",
  "p_lp_views_rate_link_clicks",
]);

export function isExcludedMetric(subItem) {
  if (!subItem) return false;
  if (EXCLUDED_METRIC_IDS.has(subItem.id)) return true;
  const label = (subItem.label || "").toLowerCase();
  if (label === "viewers") return true;
  if (label.includes("purchase") && label.includes("landing page views")) return true;
  if (label.includes("landing page views") && (label.includes("clicks") || label.includes("link clicks"))) return true;
  return false;
}

export function isMetricFilterItem(categoryId, subItem) {
  return METRIC_CATEGORY_IDS.has(categoryId) && !isExcludedMetric(subItem);
}

export function getMetricScopes(label) {
  return [
    `Campaign ${label}`,
    `Ad Set ${label}`,
    `Ad ${label}`,
  ];
}

export function getMetricTypeConfig(label) {
  const l = (label || "").toLowerCase();
  if (
    l.includes("rate") ||
    l.includes("ctr") ||
    l.includes("roas") ||
    l.includes("percentage") ||
    l.includes("frequency")
  ) {
    return { type: "rate", step: "0.01", min: "0", defaultValue: "0", placeholder: "0.00" };
  }
  if (
    l.includes("cost") ||
    l.includes("cpc") ||
    l.includes("cpm") ||
    l.includes("amount spent") ||
    l.includes("conversion value") ||
    l.includes("results value") ||
    l.includes("value")
  ) {
    return { type: "currency", step: "0.01", min: "0", defaultValue: "0", placeholder: "0.00" };
  }
  return { type: "count", step: "1", min: "0", defaultValue: "0", placeholder: "0" };
}

export function getOperatorSymbol(op) {
  switch (op) {
    case "is greater than": return ">";
    case "is smaller than": return "<";
    case "is at least": return ">=";
    case "is at most": return "<=";
    case "is": return "=";
    default: return op || ">";
  }
}

export function getOperatorFromSymbol(sym) {
  switch (sym) {
    case ">": return "is greater than";
    case "<": return "is smaller than";
    case ">=": return "is at least";
    case "<=": return "is at most";
    case "=": return "is";
    default: return sym || "is greater than";
  }
}

export function formatMetricFilterChip(scope, operator, value) {
  const symbol = getOperatorSymbol(operator);
  return `${scope} ${symbol} ${value !== undefined && value !== null && value !== "" ? value : "0"}`;
}

export function isItemMatchingMetric(subItem, itemString) {
  if (typeof itemString !== "string") return false;
  const label = subItem.label;
  if (itemString === label) return true;
  const prefixes = [
    `Campaign ${label}`,
    `Ad Set ${label}`,
    `Ad ${label}`,
    label,
    `${label} (Campaign)`,
    `${label} (Ad Set)`,
    `${label} (Ad)`,
  ];
  return prefixes.some(
    (p) =>
      itemString === p ||
      itemString.startsWith(p + " ") ||
      itemString.startsWith(p + ">") ||
      itemString.startsWith(p + "<") ||
      itemString.startsWith(p + "=")
  );
}

export function findActiveMetricInList(subItem, selectionList) {
  if (!selectionList || !Array.isArray(selectionList)) return null;
  const label = subItem.label;
  const scopes = [
    `Campaign ${label}`,
    `Ad Set ${label}`,
    `Ad ${label}`,
    `${label} (Campaign)`,
    `${label} (Ad Set)`,
    `${label} (Ad)`,
    label,
  ];

  for (const item of selectionList) {
    if (typeof item !== "string") continue;
    if (item === label) {
      return {
        matchedString: item,
        scope: `Campaign ${label}`,
        operator: "is greater than",
        value: "0",
      };
    }
    for (const sc of scopes) {
      if (item === sc) {
        return {
          matchedString: item,
          scope: sc.startsWith("Campaign") || sc.startsWith("Ad Set") || sc.startsWith("Ad") ? sc : `Campaign ${label}`,
          operator: "is greater than",
          value: "0",
        };
      }
      if (
        item.startsWith(sc + " ") ||
        item.startsWith(sc + ">") ||
        item.startsWith(sc + "<") ||
        item.startsWith(sc + "=")
      ) {
        const remaining = item.slice(sc.length).trim();
        const opMatch = remaining.match(/^([><=]+|is greater than|is smaller than|is at least|is at most|is)\s*(.*)$/i);
        if (opMatch) {
          return {
            matchedString: item,
            scope: sc.startsWith("Campaign") || sc.startsWith("Ad Set") || sc.startsWith("Ad") ? sc : `Campaign ${label}`,
            operator: getOperatorFromSymbol(opMatch[1].trim()),
            value: opMatch[2].trim() || "0",
          };
        }
      }
    }
  }
  return null;
}

/**
 * MetaFiltersPanel Component
 */
export default function MetaFiltersPanel({
  isOpen,
  onClose,
  selectedFilters = [],
  onApply,
  mode = "popover", // "docked" inside drawer or "popover" (floating dropdown)
  activeSubSection = "campaigns", // "campaigns" | "adsets" | "ads"
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingSelection, setPendingSelection] = useState([...selectedFilters]);
  const [expandedSections, setExpandedSections] = useState({ performance: true });
  const [metricConfigs, setMetricConfigs] = useState({});
  const [showSeeMore, setShowSeeMore] = useState(false);

  // Drilldown state: 'main' list view or specific field value-selector view
  const [viewMode, setViewMode] = useState("main"); // "main" | "drilldown"
  const [activeDrillField, setActiveDrillField] = useState(null);

  // Field-specific state for drilldown view
  const [drillNameOperator, setDrillNameOperator] = useState("contains all of");
  const [drillNameText, setDrillNameText] = useState("");

  const [drillIdOperator, setDrillIdOperator] = useState("is");
  const [drillIdText, setDrillIdText] = useState("");

  const [drillSelectedDelivery, setDrillSelectedDelivery] = useState(["Active"]);
  const [drillSelectedObjectives, setDrillSelectedObjectives] = useState(["Sales"]);
  const [drillGenericValue, setDrillGenericValue] = useState("");

  // Determine prefix based on subsection (Campaign / Ad set / Ad)
  const levelPrefix = useMemo(() => {
    if (activeSubSection === "adsets") return "Ad set";
    if (activeSubSection === "ads") return "Ad";
    return "Campaign";
  }, [activeSubSection]);

  // Sync pending selection whenever panel opens or initial selection changes
  useEffect(() => {
    if (isOpen) {
      setPendingSelection([...selectedFilters]);
      setSearchTerm("");
      setViewMode("main");
      setActiveDrillField(null);

      // Pre-populate metricConfigs for any active metric filter
      const initialConfigs = {};
      EXACT_FILTER_CATEGORIES.forEach((cat) => {
        if (METRIC_CATEGORY_IDS.has(cat.id)) {
          cat.subItems.forEach((sub) => {
            if (!isExcludedMetric(sub)) {
              const activeInfo = findActiveMetricInList(sub, selectedFilters);
              if (activeInfo) {
                initialConfigs[sub.id] = {
                  scope: activeInfo.scope,
                  operator: activeInfo.operator,
                  value: activeInfo.value,
                };
              }
            }
          });
        }
      });
      setMetricConfigs(initialConfigs);
    }
  }, [isOpen, selectedFilters]);

  if (!isOpen) return null;

  const toggleExpand = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleToggleRecentItem = (itemValue) => {
    setPendingSelection((prev) => {
      if (prev.includes(itemValue)) {
        return prev.filter((v) => v !== itemValue);
      } else {
        return [...prev, itemValue];
      }
    });
  };

  const handleTogglePlainItem = (itemValue) => {
    setPendingSelection((prev) => {
      if (prev.includes(itemValue)) {
        return prev.filter((v) => v !== itemValue);
      } else {
        return [...prev, itemValue];
      }
    });
  };

  // Metric Toggle
  const handleMetricToggle = (sub) => {
    const activeInfo = findActiveMetricInList(sub, pendingSelection);
    if (activeInfo) {
      setPendingSelection((prev) => prev.filter((v) => !isItemMatchingMetric(sub, v)));
    } else {
      const metricType = getMetricTypeConfig(sub.label);
      const scopes = getMetricScopes(sub.label);
      const cfg = metricConfigs[sub.id] || {
        scope: scopes[0],
        operator: "is greater than",
        value: metricType.defaultValue,
      };
      setMetricConfigs((prev) => ({ ...prev, [sub.id]: cfg }));
      const newChip = formatMetricFilterChip(cfg.scope, cfg.operator, cfg.value);
      setPendingSelection((prev) => [
        ...prev.filter((v) => !isItemMatchingMetric(sub, v)),
        newChip,
      ]);
    }
  };

  const handleScopeChange = (sub, newScope) => {
    const activeInfo = findActiveMetricInList(sub, pendingSelection);
    const metricType = getMetricTypeConfig(sub.label);
    const scopes = getMetricScopes(sub.label);
    const cfg = metricConfigs[sub.id] || activeInfo || {
      scope: scopes[0],
      operator: "is greater than",
      value: metricType.defaultValue,
    };
    const updated = { ...cfg, scope: newScope };
    setMetricConfigs((prev) => ({ ...prev, [sub.id]: updated }));
    const newChip = formatMetricFilterChip(newScope, updated.operator, updated.value);
    setPendingSelection((prev) => [
      ...prev.filter((v) => !isItemMatchingMetric(sub, v)),
      newChip,
    ]);
  };

  const handleOperatorChange = (sub, newOp) => {
    const activeInfo = findActiveMetricInList(sub, pendingSelection);
    const metricType = getMetricTypeConfig(sub.label);
    const scopes = getMetricScopes(sub.label);
    const cfg = metricConfigs[sub.id] || activeInfo || {
      scope: scopes[0],
      operator: "is greater than",
      value: metricType.defaultValue,
    };
    const updated = { ...cfg, operator: newOp };
    setMetricConfigs((prev) => ({ ...prev, [sub.id]: updated }));
    const newChip = formatMetricFilterChip(updated.scope, newOp, updated.value);
    setPendingSelection((prev) => [
      ...prev.filter((v) => !isItemMatchingMetric(sub, v)),
      newChip,
    ]);
  };

  const handleValueChange = (sub, newVal) => {
    const activeInfo = findActiveMetricInList(sub, pendingSelection);
    const metricType = getMetricTypeConfig(sub.label);
    const scopes = getMetricScopes(sub.label);
    const cfg = metricConfigs[sub.id] || activeInfo || {
      scope: scopes[0],
      operator: "is greater than",
      value: metricType.defaultValue,
    };
    const updated = { ...cfg, value: newVal };
    setMetricConfigs((prev) => ({ ...prev, [sub.id]: updated }));
    const newChip = formatMetricFilterChip(updated.scope, updated.operator, newVal);
    setPendingSelection((prev) => [
      ...prev.filter((v) => !isItemMatchingMetric(sub, v)),
      newChip,
    ]);
  };

  // Open drilldown for a specific field
  const handleOpenDrilldown = (fieldItem) => {
    setActiveDrillField(fieldItem);
    setViewMode("drilldown");

    if (fieldItem.type === "name") {
      // Find existing name chip
      const nameChip = pendingSelection.find((c) =>
        c.toLowerCase().includes("name contains") ||
        c.toLowerCase().includes("name is") ||
        c.toLowerCase().includes("name does not contain")
      );
      if (nameChip) {
        const match = nameChip.match(/name\s+(contains all of|contains any of|does not contain|is not|is)\s*(.*)/i);
        if (match) {
          setDrillNameOperator(match[1].toLowerCase());
          setDrillNameText(match[2] || "");
        } else {
          setDrillNameText("");
        }
      } else {
        setDrillNameOperator("contains all of");
        setDrillNameText("");
      }
    } else if (fieldItem.type === "id") {
      const idChip = pendingSelection.find((c) =>
        c.toLowerCase().includes("id is") || c.toLowerCase().includes("id contains")
      );
      if (idChip) {
        const match = idChip.match(/id\s+(is any of|is not|is)\s*(.*)/i);
        if (match) {
          setDrillIdOperator(match[1].toLowerCase());
          setDrillIdText(match[2] || "");
        } else {
          setDrillIdText("");
        }
      } else {
        setDrillIdOperator("is");
        setDrillIdText("");
      }
    } else if (fieldItem.type === "delivery") {
      const delivChip = pendingSelection.find((c) => c.toLowerCase().includes("delivery"));
      if (delivChip) {
        const found = [];
        if (delivChip.includes("Active")) found.push("Active");
        if (delivChip.includes("Pending")) found.push("Pending");
        if (delivChip.includes("In draft")) found.push("In draft");
        if (delivChip.includes("Learning")) found.push("Learning");
        if (delivChip.includes("Completed")) found.push("Completed");
        if (delivChip.includes("Off") || delivChip.includes("Inactive")) found.push("Off");
        if (delivChip.includes("Has issues") || delivChip.includes("errors")) found.push("Has issues");
        setDrillSelectedDelivery(found.length > 0 ? found : ["Active"]);
      } else {
        setDrillSelectedDelivery(["Active"]);
      }
    } else if (fieldItem.type === "objectives") {
      const objChip = pendingSelection.find((c) => c.toLowerCase().includes("objective"));
      if (objChip) {
        const found = [];
        ["Sales", "Leads", "Engagement", "App promotion", "Traffic", "Awareness"].forEach((o) => {
          if (objChip.toLowerCase().includes(o.toLowerCase())) found.push(o);
        });
        setDrillSelectedObjectives(found.length > 0 ? found : ["Sales"]);
      } else {
        setDrillSelectedObjectives(["Sales"]);
      }
    } else {
      // Generic field (Attribution setting, Campaign setup, etc.)
      const fieldTitle = fieldItem.name;
      const existingChip = pendingSelection.find((c) => c.toLowerCase().includes(fieldTitle.toLowerCase()));
      if (existingChip) {
        const val = existingChip.split(/is\s*/i)[1] || existingChip;
        setDrillGenericValue(val.trim());
      } else {
        setDrillGenericValue("");
      }
    }
  };

  // Back from drilldown to main menu
  const handleDrillBack = () => {
    setViewMode("main");
    setActiveDrillField(null);
  };

  // Save current drilldown changes into pendingSelection
  const handleSaveDrilldown = (applyNow = false) => {
    if (!activeDrillField) return;

    if (activeDrillField.type === "name") {
      const filtered = pendingSelection.filter((c) => !c.toLowerCase().includes("name contains") && !c.toLowerCase().includes("name is"));
      if (drillNameText.trim()) {
        const newChip = `${levelPrefix} name ${drillNameOperator} ${drillNameText.trim()}`;
        setPendingSelection([...filtered, newChip]);
        if (applyNow && onApply) {
          onApply([...filtered, newChip]);
          if (onClose) onClose();
          return;
        }
      } else {
        setPendingSelection(filtered);
        if (applyNow && onApply) {
          onApply(filtered);
          if (onClose) onClose();
          return;
        }
      }
    } else if (activeDrillField.type === "id") {
      const filtered = pendingSelection.filter((c) => !c.toLowerCase().includes("id is") && !c.toLowerCase().includes("id contains"));
      if (drillIdText.trim()) {
        const newChip = `${levelPrefix} ID ${drillIdOperator} ${drillIdText.trim()}`;
        setPendingSelection([...filtered, newChip]);
        if (applyNow && onApply) {
          onApply([...filtered, newChip]);
          if (onClose) onClose();
          return;
        }
      } else {
        setPendingSelection(filtered);
        if (applyNow && onApply) {
          onApply(filtered);
          if (onClose) onClose();
          return;
        }
      }
    } else if (activeDrillField.type === "delivery") {
      const filtered = pendingSelection.filter((c) => !c.toLowerCase().includes("delivery"));
      if (drillSelectedDelivery.length === 1) {
        const newChip = `${levelPrefix} delivery is ${drillSelectedDelivery[0]}`;
        setPendingSelection([...filtered, newChip]);
        if (applyNow && onApply) {
          onApply([...filtered, newChip]);
          if (onClose) onClose();
          return;
        }
      } else if (drillSelectedDelivery.length > 1) {
        const newChip = `${levelPrefix} delivery is one of ${drillSelectedDelivery.join(", ")}`;
        setPendingSelection([...filtered, newChip]);
        if (applyNow && onApply) {
          onApply([...filtered, newChip]);
          if (onClose) onClose();
          return;
        }
      } else {
        setPendingSelection(filtered);
        if (applyNow && onApply) {
          onApply(filtered);
          if (onClose) onClose();
          return;
        }
      }
    } else if (activeDrillField.type === "objectives") {
      const filtered = pendingSelection.filter((c) => !c.toLowerCase().includes("objective"));
      if (drillSelectedObjectives.length === 1) {
        const newChip = `Objective is ${drillSelectedObjectives[0]}`;
        setPendingSelection([...filtered, newChip]);
        if (applyNow && onApply) {
          onApply([...filtered, newChip]);
          if (onClose) onClose();
          return;
        }
      } else if (drillSelectedObjectives.length > 1) {
        const newChip = `Objective is one of ${drillSelectedObjectives.join(", ")}`;
        setPendingSelection([...filtered, newChip]);
        if (applyNow && onApply) {
          onApply([...filtered, newChip]);
          if (onClose) onClose();
          return;
        }
      } else {
        setPendingSelection(filtered);
        if (applyNow && onApply) {
          onApply(filtered);
          if (onClose) onClose();
          return;
        }
      }
    } else {
      // Generic field
      const fieldTitle = activeDrillField.name;
      const filtered = pendingSelection.filter((c) => !c.toLowerCase().includes(fieldTitle.toLowerCase()));
      if (drillGenericValue) {
        const newChip = `${fieldTitle} is ${drillGenericValue}`;
        setPendingSelection([...filtered, newChip]);
        if (applyNow && onApply) {
          onApply([...filtered, newChip]);
          if (onClose) onClose();
          return;
        }
      } else {
        setPendingSelection(filtered);
        if (applyNow && onApply) {
          onApply(filtered);
          if (onClose) onClose();
          return;
        }
      }
    }

    setViewMode("main");
    setActiveDrillField(null);
  };

  const handleApply = () => {
    if (viewMode === "drilldown") {
      handleSaveDrilldown(true);
      return;
    }
    if (onApply) {
      onApply(pendingSelection);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    setPendingSelection([...selectedFilters]);
    setViewMode("main");
    setActiveDrillField(null);
    if (onClose) {
      onClose();
    }
  };

  // Filter items according to search query
  const query = searchTerm.trim().toLowerCase();

  const filteredRecentSearches = EXACT_RECENT_SEARCHES.filter((item) =>
    query ? item.label.toLowerCase().includes(query) : true
  );

  const filteredCategories = EXACT_FILTER_CATEGORIES.map((cat) => {
    const matchingSubs = cat.subItems.filter((sub) =>
      query ? sub.label.toLowerCase().includes(query) : true
    );
    const catMatches = cat.name.toLowerCase().includes(query);
    return {
      ...cat,
      matches: catMatches || matchingSubs.length > 0,
      visibleSubs: matchingSubs,
    };
  }).filter((cat) => (query ? cat.matches : true));

  const displayFilterItems = EXACT_FILTER_ITEMS.map((item) => {
    let displayName = item.name;
    if (item.id === "item_name") displayName = `${levelPrefix} name`;
    if (item.id === "item_id") displayName = `${levelPrefix} ID`;
    if (item.id === "item_delivery") displayName = `${levelPrefix} delivery`;
    return {
      ...item,
      displayName,
    };
  });

  const filteredSingleItems = displayFilterItems.map((item) => {
    if (item.isExpandable) {
      const matchingSubs = item.subItems.filter((sub) =>
        query ? sub.label.toLowerCase().includes(query) : true
      );
      const itemMatches = item.displayName.toLowerCase().includes(query);
      return {
        ...item,
        matches: itemMatches || matchingSubs.length > 0,
        visibleSubs: matchingSubs,
      };
    }
    return {
      ...item,
      matches: query ? item.displayName.toLowerCase().includes(query) : true,
    };
  }).filter((item) => (query ? item.matches : true));

  const filteredSeeMoreItems = EXACT_SEE_MORE_ITEMS.filter((item) =>
    query ? item.name.toLowerCase().includes(query) : true
  );

  const hasChanges =
    JSON.stringify([...pendingSelection].sort()) !==
    JSON.stringify([...selectedFilters].sort());

  const containerStyle =
    mode === "docked"
      ? {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "#ffffff",
          zIndex: 70,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }
      : {
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          width: 350,
          maxHeight: 520,
          background: "#ffffff",
          borderRadius: 8,
          border: "1px solid #ced0d4",
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          overflow: "hidden",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        };

  // RENDER DRILLDOWN VIEW
  if (viewMode === "drilldown" && activeDrillField) {
    let title = activeDrillField.displayName || activeDrillField.name;

    return (
      <div style={containerStyle}>
        {/* Drilldown Top Header: ← [Field Name] ✕ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderBottom: "1px solid #f0f2f5",
            background: "#ffffff",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={handleDrillBack}
            aria-label="Back to Filters"
            style={{
              background: "transparent",
              border: "none",
              padding: 4,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1c1e21",
              borderRadius: "50%",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <ArrowLeft size={18} />
          </button>

          <span
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#1c1e21",
            }}
          >
            {title}
          </span>

          <button
            type="button"
            onClick={handleCancel}
            aria-label="Close"
            style={{
              background: "transparent",
              border: "none",
              padding: 4,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1c1e21",
              borderRadius: "50%",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drilldown Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 14px",
            scrollbarWidth: "thin",
          }}
        >
          {/* 1. DELIVERY DRILLDOWN */}
          {activeDrillField.type === "delivery" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: "0.82rem", color: "#65676b", marginBottom: 6 }}>
                Select delivery status to filter:
              </div>
              {[
                { id: "Active", label: "Active", dot: "#31a24c", hollow: false },
                { id: "Pending", label: "Pending", dot: "#31a24c", hollow: true },
                { id: "In draft", label: "In draft", dot: "#64748b", hollow: false },
                { id: "Learning", label: "Learning", dot: "#0064e1", hollow: false },
                { id: "Off", label: "Off / Inactive", dot: "#94a3b8", hollow: false },
                { id: "Completed", label: "Completed", dot: "#64748b", hollow: false },
                { id: "Has issues", label: "Has issues / Errors", dot: "#ef4444", hollow: false },
              ].map((opt) => {
                const isChecked = drillSelectedDelivery.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      setDrillSelectedDelivery((prev) =>
                        prev.includes(opt.id)
                          ? prev.filter((i) => i !== opt.id)
                          : [...prev, opt.id]
                      );
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 6,
                      background: isChecked ? "#e7f3ff" : "transparent",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isChecked) e.currentTarget.style.background = "#f0f2f5";
                    }}
                    onMouseLeave={(e) => {
                      if (!isChecked) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: isChecked ? "2px solid #0064e1" : "1.8px solid #cbd5e1",
                        background: isChecked ? "#0064e1" : "#ffffff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {isChecked && <Check size={13} color="#ffffff" strokeWidth={3} />}
                    </span>

                    <span
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: opt.hollow ? "#ffffff" : opt.dot,
                        border: opt.hollow ? `1.8px solid ${opt.dot}` : "none",
                        boxSizing: "border-box",
                        flexShrink: 0,
                      }}
                    />

                    <span
                      style={{
                        fontSize: "0.86rem",
                        color: isChecked ? "#0064e1" : "#1c1e21",
                        fontWeight: isChecked ? 600 : 400,
                      }}
                    >
                      {opt.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. OBJECTIVES DRILLDOWN */}
          {activeDrillField.type === "objectives" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: "0.82rem", color: "#65676b", marginBottom: 6 }}>
                Select campaign objective(s):
              </div>
              {[
                { id: "Sales", label: "Sales" },
                { id: "Leads", label: "Leads" },
                { id: "Engagement", label: "Engagement" },
                { id: "App promotion", label: "App promotion" },
                { id: "Traffic", label: "Traffic" },
                { id: "Awareness", label: "Awareness" },
              ].map((opt) => {
                const isChecked = drillSelectedObjectives.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      setDrillSelectedObjectives((prev) =>
                        prev.includes(opt.id)
                          ? prev.filter((i) => i !== opt.id)
                          : [...prev, opt.id]
                      );
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 6,
                      background: isChecked ? "#e7f3ff" : "transparent",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isChecked) e.currentTarget.style.background = "#f0f2f5";
                    }}
                    onMouseLeave={(e) => {
                      if (!isChecked) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: isChecked ? "2px solid #0064e1" : "1.8px solid #cbd5e1",
                        background: isChecked ? "#0064e1" : "#ffffff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {isChecked && <Check size={13} color="#ffffff" strokeWidth={3} />}
                    </span>

                    <span
                      style={{
                        fontSize: "0.86rem",
                        color: isChecked ? "#0064e1" : "#1c1e21",
                        fontWeight: isChecked ? 600 : 400,
                      }}
                    >
                      {opt.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. NAME DRILLDOWN */}
          {activeDrillField.type === "name" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1c1e21", display: "block", marginBottom: 4 }}>
                  Match condition
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={drillNameOperator}
                    onChange={(e) => setDrillNameOperator(e.target.value)}
                    style={{
                      width: "100%",
                      height: 36,
                      border: "1px solid #ced0d4",
                      borderRadius: 6,
                      background: "#ffffff",
                      padding: "0 28px 0 10px",
                      fontSize: "0.86rem",
                      color: "#1c1e21",
                      appearance: "none",
                      outline: "none",
                    }}
                  >
                    <option value="contains all of">contains all of</option>
                    <option value="contains any of">contains any of</option>
                    <option value="does not contain">does not contain</option>
                    <option value="is">is</option>
                    <option value="is not">is not</option>
                  </select>
                  <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "0.6rem" }}>
                    ▼
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1c1e21", display: "block", marginBottom: 4 }}>
                  Value
                </label>
                <input
                  type="text"
                  value={drillNameText}
                  onChange={(e) => setDrillNameText(e.target.value)}
                  placeholder="e.g. njm, Summer, Growth"
                  style={{
                    width: "100%",
                    height: 36,
                    border: "1px solid #ced0d4",
                    borderRadius: 6,
                    padding: "0 10px",
                    fontSize: "0.86rem",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#0064e1")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#ced0d4")}
                />
              </div>
            </div>
          )}

          {/* 4. ID DRILLDOWN */}
          {activeDrillField.type === "id" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1c1e21", display: "block", marginBottom: 4 }}>
                  Match condition
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={drillIdOperator}
                    onChange={(e) => setDrillIdOperator(e.target.value)}
                    style={{
                      width: "100%",
                      height: 36,
                      border: "1px solid #ced0d4",
                      borderRadius: 6,
                      background: "#ffffff",
                      padding: "0 28px 0 10px",
                      fontSize: "0.86rem",
                      color: "#1c1e21",
                      appearance: "none",
                      outline: "none",
                    }}
                  >
                    <option value="is">is</option>
                    <option value="is any of">is any of</option>
                    <option value="is not">is not</option>
                  </select>
                  <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "0.6rem" }}>
                    ▼
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1c1e21", display: "block", marginBottom: 4 }}>
                  ID(s)
                </label>
                <input
                  type="text"
                  value={drillIdText}
                  onChange={(e) => setDrillIdText(e.target.value)}
                  placeholder="e.g. c-1, c-3, 12020581920391"
                  style={{
                    width: "100%",
                    height: 36,
                    border: "1px solid #ced0d4",
                    borderRadius: 6,
                    padding: "0 10px",
                    fontSize: "0.86rem",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#0064e1")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#ced0d4")}
                />
              </div>
            </div>
          )}

          {/* 5. GENERIC OPTIONS DRILLDOWN (Setup, Placement, Attribution, Special ad category, etc.) */}
          {["campaign_setup", "performance_goal", "conversion_location", "placement", "attribution_setting", "special_ad_category", "ad_changed", "catalogue", "campaign_tag", "buying_type", "bid_strategy", "budget_type"].includes(activeDrillField.type) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(() => {
                let options = [];
                if (activeDrillField.type === "campaign_setup") {
                  options = ["Advantage+ campaign", "Manual campaign", "Tailored campaign"];
                } else if (activeDrillField.type === "performance_goal") {
                  options = [
                    "Maximize number of conversions",
                    "Maximize value of conversions",
                    "Maximize number of link clicks",
                    "Maximize reach of ads",
                    "Maximize number of impressions",
                    "Maximize 2-second continuous video plays",
                    "Maximize ThruPlay",
                  ];
                } else if (activeDrillField.type === "conversion_location") {
                  options = ["Website", "App", "Website and app", "Messenger", "WhatsApp", "Calls", "Facebook Page"];
                } else if (activeDrillField.type === "placement") {
                  options = [
                    "Advantage+ placements (recommended)",
                    "Facebook Feed",
                    "Instagram Feed",
                    "Facebook Marketplace",
                    "Facebook Video Feeds",
                    "Stories and Reels",
                    "Messenger Inbox",
                  ];
                } else if (activeDrillField.type === "attribution_setting") {
                  options = ["7-day click or 1-day view", "1-day click or 1-day view", "1-day click", "7-day click"];
                } else if (activeDrillField.type === "special_ad_category") {
                  options = ["Credit", "Employment", "Housing", "Social issues, elections or politics", "None"];
                } else if (activeDrillField.type === "ad_changed") {
                  options = ["Recently updated", "Within last 7 days", "Within last 30 days"];
                } else if (activeDrillField.type === "catalogue") {
                  options = ["Has catalogue connected", "No catalogue connected"];
                } else if (activeDrillField.type === "campaign_tag") {
                  options = ["Summer", "Q3 Promo", "Scaling", "Retargeting", "Testing", "High ROAS"];
                } else if (activeDrillField.type === "buying_type") {
                  options = ["Auction", "Reservation"];
                } else if (activeDrillField.type === "bid_strategy") {
                  options = ["Highest volume", "Cost per result goal", "Bid cap"];
                } else if (activeDrillField.type === "budget_type") {
                  options = ["Daily budget", "Lifetime budget", "Advantage campaign budget"];
                }

                return options.map((opt) => {
                  const isChecked = drillGenericValue === opt;
                  return (
                    <div
                      key={opt}
                      onClick={() => setDrillGenericValue(isChecked ? "" : opt)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        borderRadius: 6,
                        background: isChecked ? "#e7f3ff" : "transparent",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!isChecked) e.currentTarget.style.background = "#f0f2f5";
                      }}
                      onMouseLeave={(e) => {
                        if (!isChecked) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border: isChecked ? "2px solid #0064e1" : "1.8px solid #cbd5e1",
                          background: "#ffffff",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {isChecked && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#0064e1",
                            }}
                          />
                        )}
                      </span>
                      <span
                        style={{
                          fontSize: "0.86rem",
                          color: isChecked ? "#0064e1" : "#1c1e21",
                          fontWeight: isChecked ? 600 : 400,
                        }}
                      >
                        {opt}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* Drilldown Sticky Bottom Footer: Cancel & Apply */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderTop: "1px solid #e4e6eb",
            background: "#ffffff",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={handleDrillBack}
            style={{
              background: "#ffffff",
              border: "1px solid #ced0d4",
              borderRadius: 6,
              padding: "6px 16px",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#1c1e21",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => handleSaveDrilldown(false)}
            style={{
              background: "#0064e1",
              border: "none",
              borderRadius: 6,
              padding: "6px 20px",
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#ffffff",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#0053ba")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#0064e1")}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // RENDER ROOT (MAIN) VIEW
  return (
    <div style={containerStyle}>
      {/* Top Header: ← Filters ✕ (Image 1) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: "1px solid #f0f2f5",
          background: "#ffffff",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Back"
          style={{
            background: "transparent",
            border: "none",
            padding: 4,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1c1e21",
            borderRadius: "50%",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <ArrowLeft size={18} />
        </button>

        <span
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "#1c1e21",
          }}
        >
          Filters
        </span>

        <button
          type="button"
          onClick={handleCancel}
          aria-label="Close"
          style={{
            background: "transparent",
            border: "none",
            padding: 4,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1c1e21",
            borderRadius: "50%",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <X size={18} />
        </button>
      </div>

      {/* Search Input inside Popover: "Search to filter by name, ID or metrics" (Image 1) */}
      <div
        style={{
          padding: "8px 12px 10px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #ced0d4",
            borderRadius: 6,
            background: "#ffffff",
            padding: "0 10px",
            height: 36,
            boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search to filter by name, ID or metrics"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "0.82rem",
              color: "#1c1e21",
              fontFamily: "inherit",
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 2,
                color: "#65676b",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Body: Recent searches + Filters (Images 1, 2, 3, 4) */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 6px 12px",
          scrollbarWidth: "thin",
        }}
      >
        {/* Section 1: Recent searches (Image 1) */}
        {filteredRecentSearches.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#1c1e21",
                padding: "6px 8px 4px",
              }}
            >
              Recent searches
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {filteredRecentSearches.map((item) => {
                const isSelected = pendingSelection.includes(item.value);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleRecentItem(item.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: 5,
                      background: isSelected ? "#e7f3ff" : "transparent",
                      color: isSelected ? "#0064e1" : "#1c1e21",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      transition: "background 0.1s",
                      userSelect: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "#f0f2f5";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                      {item.render()}
                    </div>
                    {isSelected && <Check size={14} color="#0064e1" strokeWidth={2.4} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Divider before Filters */}
        <div style={{ height: 1, background: "#e4e6eb", margin: "6px 4px 10px" }} />

        {/* Section 2: Filters (Images 2, 3, 4) */}
        <div>
          <div
            style={{
              fontSize: "0.88rem",
              fontWeight: 700,
              color: "#1c1e21",
              padding: "4px 8px 6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Filters</span>
          </div>

          {/* Expandable Category Groups: Performance, Engagement, Conversions (Image 2) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {filteredCategories.map((cat) => {
              const isExpanded = expandedSections[cat.id] || Boolean(query);
              const isCatMetric = METRIC_CATEGORY_IDS.has(cat.id);
              const hasActiveSub = cat.subItems.some((s) => {
                if (isCatMetric && !isExcludedMetric(s)) {
                  return Boolean(findActiveMetricInList(s, pendingSelection));
                }
                return pendingSelection.includes(s.label);
              });

              return (
                <div key={cat.id}>
                  <div
                    onClick={() => toggleExpand(cat.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: 5,
                      background: hasActiveSub ? "#f0f7ff" : "transparent",
                      color: hasActiveSub ? "#0064e1" : "#1c1e21",
                      fontSize: "0.84rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "background 0.1s",
                      userSelect: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!hasActiveSub) e.currentTarget.style.background = "#f0f2f5";
                    }}
                    onMouseLeave={(e) => {
                      if (!hasActiveSub) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span>{cat.name}</span>
                    {isExpanded ? (
                      <ChevronUp size={15} color="#65676b" />
                    ) : (
                      <ChevronDown size={15} color="#65676b" />
                    )}
                  </div>

                  {/* Sub-items if expanded */}
                  {isExpanded && (
                    <div
                      style={{
                        paddingLeft: 12,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        marginTop: 2,
                        marginBottom: 4,
                      }}
                    >
                      {(cat.visibleSubs || cat.subItems).map((sub) => {
                        const isMetric = isCatMetric && !isExcludedMetric(sub);
                        const activeInfo = isMetric ? findActiveMetricInList(sub, pendingSelection) : null;
                        const isSubSelected = isMetric ? Boolean(activeInfo) : pendingSelection.includes(sub.label);

                        const metricType = isMetric ? getMetricTypeConfig(sub.label) : null;
                        const scopes = isMetric ? getMetricScopes(sub.label) : [];
                        const currentCfg = isMetric
                          ? metricConfigs[sub.id] || activeInfo || {
                              scope: scopes[0],
                              operator: "is greater than",
                              value: metricType.defaultValue,
                            }
                          : null;

                        return (
                          <div key={sub.id} style={{ display: "flex", flexDirection: "column" }}>
                            {/* Main clickable row */}
                            <div
                              onClick={() => {
                                if (isMetric) {
                                  handleMetricToggle(sub);
                                } else {
                                  handleTogglePlainItem(sub.label);
                                }
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "6px 8px",
                                borderRadius: 4,
                                background: isSubSelected && !isMetric ? "#e7f3ff" : "transparent",
                                cursor: "pointer",
                                userSelect: "none",
                                transition: "background 0.1s",
                              }}
                              onMouseEnter={(e) => {
                                if (!isSubSelected || isMetric) e.currentTarget.style.background = "#f0f2f5";
                              }}
                              onMouseLeave={(e) => {
                                if (!isSubSelected || isMetric) e.currentTarget.style.background = "transparent";
                              }}
                            >
                              {/* Radio/checkbox circle matching Images 1, 2, 3 */}
                              <span
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: "50%",
                                  border: isSubSelected
                                    ? "2px solid #0064e1"
                                    : "1.8px solid #cbd5e1",
                                  background: "#ffffff",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  boxSizing: "border-box",
                                }}
                              >
                                {isSubSelected && (
                                  <span
                                    style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      background: "#0064e1",
                                    }}
                                  />
                                )}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.83rem",
                                  color: isSubSelected && !isMetric ? "#0064e1" : "#1c1e21",
                                  fontWeight: isSubSelected ? 600 : 400,
                                  lineHeight: 1.35,
                                  flex: 1,
                                }}
                              >
                                {sub.label}
                              </span>
                            </div>

                            {/* Dynamic Metric Sub-Dropdowns, Comparison Operators, and Value Inputs */}
                            {isMetric && isSubSelected && currentCfg && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 6,
                                  padding: "4px 8px 8px 8px",
                                }}
                              >
                                {/* 1. Scope Sub-Dropdown */}
                                <div style={{ position: "relative", width: "100%" }}>
                                  <select
                                    value={currentCfg.scope}
                                    onChange={(e) => handleScopeChange(sub, e.target.value)}
                                    style={{
                                      width: "100%",
                                      height: 36,
                                      border: "1px solid #ced0d4",
                                      borderRadius: 6,
                                      background: "#ffffff",
                                      color: "#1c1e21",
                                      fontSize: "0.86rem",
                                      padding: "0 28px 0 10px",
                                      appearance: "none",
                                      WebkitAppearance: "none",
                                      cursor: "pointer",
                                      outline: "none",
                                      boxSizing: "border-box",
                                      fontFamily: "inherit",
                                      transition: "border-color 0.15s",
                                    }}
                                    onFocus={(e) => (e.currentTarget.style.borderColor = "#0064e1")}
                                    onBlur={(e) => (e.currentTarget.style.borderColor = "#ced0d4")}
                                  >
                                    {scopes.map((scopeOption) => (
                                      <option key={scopeOption} value={scopeOption}>
                                        {scopeOption}
                                      </option>
                                    ))}
                                  </select>
                                  <div
                                    style={{
                                      position: "absolute",
                                      right: 12,
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      pointerEvents: "none",
                                      fontSize: "0.6rem",
                                      color: "#1c1e21",
                                    }}
                                  >
                                    ▼
                                  </div>
                                </div>

                                {/* 2. Comparison Operator Dropdown */}
                                <div style={{ position: "relative", width: "100%" }}>
                                  <select
                                    value={currentCfg.operator}
                                    onChange={(e) => handleOperatorChange(sub, e.target.value)}
                                    style={{
                                      width: "100%",
                                      height: 36,
                                      border: "1px solid #ced0d4",
                                      borderRadius: 6,
                                      background: "#ffffff",
                                      color: "#1c1e21",
                                      fontSize: "0.86rem",
                                      padding: "0 28px 0 10px",
                                      appearance: "none",
                                      WebkitAppearance: "none",
                                      cursor: "pointer",
                                      outline: "none",
                                      boxSizing: "border-box",
                                      fontFamily: "inherit",
                                      transition: "border-color 0.15s",
                                    }}
                                    onFocus={(e) => (e.currentTarget.style.borderColor = "#0064e1")}
                                    onBlur={(e) => (e.currentTarget.style.borderColor = "#ced0d4")}
                                  >
                                    {METRIC_COMPARISON_OPERATORS.map((op) => (
                                      <option key={op.value} value={op.value}>
                                        {op.label}
                                      </option>
                                    ))}
                                  </select>
                                  <div
                                    style={{
                                      position: "absolute",
                                      right: 12,
                                      top: "50%",
                                      transform: "translateY(-50%)",
                                      pointerEvents: "none",
                                      fontSize: "0.6rem",
                                      color: "#1c1e21",
                                    }}
                                  >
                                    ▼
                                  </div>
                                </div>

                                {/* 3. Numerical Value Input */}
                                <div style={{ position: "relative", width: "100%" }}>
                                  <input
                                    type="number"
                                    min={metricType.min}
                                    step={metricType.step}
                                    value={currentCfg.value}
                                    placeholder={metricType.placeholder}
                                    onChange={(e) => handleValueChange(sub, e.target.value)}
                                    style={{
                                      width: "100%",
                                      height: 36,
                                      border: "1px solid #ced0d4",
                                      borderRadius: 6,
                                      background: "#ffffff",
                                      color: "#1c1e21",
                                      fontSize: "0.88rem",
                                      padding: "0 10px",
                                      outline: "none",
                                      boxSizing: "border-box",
                                      fontFamily: "inherit",
                                      transition: "border-color 0.15s",
                                    }}
                                    onFocus={(e) => (e.currentTarget.style.borderColor = "#0064e1")}
                                    onBlur={(e) => (e.currentTarget.style.borderColor = "#ced0d4")}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Divider line between categories and individual items */}
          <div style={{ height: 1, background: "#e4e6eb", margin: "6px 4px 8px" }} />

          {/* Individual Filter Items (Images 2, 3, 4) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {filteredSingleItems.map((item) => {
              if (item.isExpandable) {
                const isExpanded = expandedSections[item.id] || Boolean(query);
                const hasActiveSub = item.subItems.some((s) => pendingSelection.includes(s.label));

                return (
                  <div key={item.id}>
                    <div
                      onClick={() => toggleExpand(item.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 10px",
                        borderRadius: 5,
                        background: hasActiveSub ? "#f0f7ff" : "transparent",
                        color: hasActiveSub ? "#0064e1" : "#1c1e21",
                        fontSize: "0.84rem",
                        cursor: "pointer",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        if (!hasActiveSub) e.currentTarget.style.background = "#f0f2f5";
                      }}
                      onMouseLeave={(e) => {
                        if (!hasActiveSub) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span>{item.displayName}</span>
                      {isExpanded ? (
                        <ChevronUp size={15} color="#65676b" />
                      ) : (
                        <ChevronDown size={15} color="#65676b" />
                      )}
                    </div>

                    {isExpanded && (
                      <div
                        style={{
                          paddingLeft: 12,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          marginTop: 2,
                          marginBottom: 4,
                        }}
                      >
                        {(item.visibleSubs || item.subItems).map((sub) => {
                          const isSubSelected = pendingSelection.includes(sub.label);
                          return (
                            <div
                              key={sub.id}
                              onClick={() => handleTogglePlainItem(sub.label)}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 10,
                                padding: "6px 8px",
                                borderRadius: 4,
                                background: isSubSelected ? "#e7f3ff" : "transparent",
                                cursor: "pointer",
                                userSelect: "none",
                                transition: "background 0.1s",
                              }}
                              onMouseEnter={(e) => {
                                if (!isSubSelected) e.currentTarget.style.background = "#f0f2f5";
                              }}
                              onMouseLeave={(e) => {
                                if (!isSubSelected) e.currentTarget.style.background = "transparent";
                              }}
                            >
                              <span
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: "50%",
                                  border: isSubSelected
                                    ? "2px solid #0064e1"
                                    : "1.8px solid #cbd5e1",
                                  background: "#ffffff",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  marginTop: 1,
                                  boxSizing: "border-box",
                                }}
                              >
                                {isSubSelected && (
                                  <span
                                    style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      background: "#0064e1",
                                    }}
                                  />
                                )}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.83rem",
                                  color: isSubSelected ? "#0064e1" : "#1c1e21",
                                  fontWeight: isSubSelected ? 600 : 400,
                                  lineHeight: 1.35,
                                  flex: 1,
                                }}
                              >
                                {sub.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Non-expandable items: opens dynamic field-specific value selector drilldown
              const isItemActive = pendingSelection.some((c) =>
                c.toLowerCase().includes(item.displayName.toLowerCase()) ||
                (item.id === "objectives" && c.toLowerCase().includes("objective")) ||
                (item.id === "item_delivery" && c.toLowerCase().includes("delivery")) ||
                (item.id === "item_name" && c.toLowerCase().includes("name contains")) ||
                (item.id === "item_id" && c.toLowerCase().includes("id is"))
              );

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenDrilldown(item)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    borderRadius: 5,
                    background: isItemActive ? "#f0f7ff" : "transparent",
                    color: isItemActive ? "#0064e1" : "#1c1e21",
                    fontSize: "0.84rem",
                    cursor: "pointer",
                    transition: "background 0.1s",
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isItemActive) e.currentTarget.style.background = "#f0f2f5";
                  }}
                  onMouseLeave={(e) => {
                    if (!isItemActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span>{item.displayName}</span>
                  {isItemActive && <Check size={14} color="#0064e1" strokeWidth={2.4} />}
                </div>
              );
            })}

            {/* See more button and items */}
            {filteredSeeMoreItems.length > 0 && (
              <div>
                <div
                  onClick={() => setShowSeeMore(!showSeeMore)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    borderRadius: 5,
                    color: "#0064e1",
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span>{showSeeMore ? "See less" : "See more"}</span>
                  {showSeeMore ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </div>

                {showSeeMore && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 1, marginTop: 2 }}>
                    {filteredSeeMoreItems.map((item) => {
                      const isItemActive = pendingSelection.some((c) =>
                        c.toLowerCase().includes(item.name.toLowerCase())
                      );
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleOpenDrilldown(item)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 10px",
                            borderRadius: 5,
                            background: isItemActive ? "#f0f7ff" : "transparent",
                            color: isItemActive ? "#0064e1" : "#1c1e21",
                            fontSize: "0.84rem",
                            cursor: "pointer",
                            transition: "background 0.1s",
                            userSelect: "none",
                          }}
                          onMouseEnter={(e) => {
                            if (!isItemActive) e.currentTarget.style.background = "#f0f2f5";
                          }}
                          onMouseLeave={(e) => {
                            if (!isItemActive) e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <span>{item.name}</span>
                          {isItemActive && <Check size={14} color="#0064e1" strokeWidth={2.4} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Footer: Cancel & Apply (Images 1, 4) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderTop: "1px solid #e4e6eb",
          background: "#ffffff",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={handleCancel}
          style={{
            background: "#ffffff",
            border: "1px solid #ced0d4",
            borderRadius: 6,
            padding: "6px 16px",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "#1c1e21",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f2f5")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleApply}
          style={{
            background: hasChanges || pendingSelection.length > 0 ? "#0064e1" : "#bcd7f9",
            border: "none",
            borderRadius: 6,
            padding: "6px 20px",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "#ffffff",
            cursor: hasChanges || pendingSelection.length > 0 ? "pointer" : "default",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            if (hasChanges || pendingSelection.length > 0)
              e.currentTarget.style.background = "#0053ba";
          }}
          onMouseLeave={(e) => {
            if (hasChanges || pendingSelection.length > 0)
              e.currentTarget.style.background = "#0064e1";
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

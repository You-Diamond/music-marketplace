import { SubscriptionPlan } from "@/types/subscription"

export const subscriptionPlansMock: SubscriptionPlan[] =
  [
    {
      id: "starter",

      title: "Starter",

      description:
        "For beginner producers starting their catalog.",

      monthlyPrice: 9,

      yearlyPrice: 79,

      features: [
        {
          title:
            "Upload up to 25 beats",
        },

        {
          title:
            "Basic analytics",
        },

        {
          title:
            "Standard licensing",
        },

        {
          title:
            "Marketplace access",
        },
      ],
    },

    {
      id: "pro",

      title: "Pro",

      description:
        "Advanced creator tools for professional producers.",

      monthlyPrice: 29,

      yearlyPrice: 249,

      popular: true,

      features: [
        {
          title:
            "Unlimited beat uploads",
        },

        {
          title:
            "Advanced analytics",
        },

        {
          title:
            "Custom contracts",
        },

        {
          title:
            "Priority discovery",
        },

        {
          title:
            "Unlimited licenses",
        },

        {
          title:
            "Realtime sales stats",
        },
      ],
    },

    {
      id: "label",

      title: "Label",

      description:
        "Team management and enterprise creator infrastructure.",

      monthlyPrice: 99,

      yearlyPrice: 899,

      features: [
        {
          title:
            "Multiple team accounts",
        },

        {
          title:
            "Revenue splitting",
        },

        {
          title:
            "Advanced payouts",
        },

        {
          title:
            "API access",
        },

        {
          title:
            "White-label licensing",
        },
      ],
    },
  ]
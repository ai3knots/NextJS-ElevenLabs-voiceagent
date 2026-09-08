import { NextResponse } from 'next/server';
import { MarketingPlan } from '@/types/marketing';

const marketingPlans: MarketingPlan[] = [
  {
    id: 'silver',
    name: 'Silver Marketing Plan',
    durationMonths: 6,
    price: 6299,
    features: [
      {
        title: 'Extended Publishing on 15 Platforms',
        description: 'Publish your book across 15 major platforms, reaching over 40,000 bookstores and libraries worldwide in eBook and paperback formats.',
        outcome: 'Greater visibility, wider audience reach, and increased sales opportunities.'
      },
      {
        title: 'Design Optimization & Creation',
        description: 'Professional banner designs, A/B testing, Author Central optimization, and A+ Content creation to maximize reader engagement.',
        outcome: 'Stronger branding, higher click-through rates, and improved conversions.'
      },
      {
        title: 'Google Knowledge Panel',
        description: 'Strengthen your online authority and eligibility for a Google Knowledge Panel through strategic branding and optimization.',
        outcome: 'Increased credibility, visibility, and author recognition.'
      },
      {
        title: 'Social Media Presence & Credibility',
        description: 'Professional setup and optimization of your social media profiles with consistent branding and audience-building strategies.',
        outcome: 'Enhanced credibility, stronger online presence, and increased reader trust.'
      },
      {
        title: 'Social Media Marketing & Management',
        description: 'Content creation, audience engagement, targeted advertising, and campaign optimization across major social platforms.',
        outcome: 'Increased brand awareness, audience growth, and book sales.'
      },
      {
        title: 'Video Trailer Creation & Advertising',
        description: 'Custom book trailers promoted through Facebook, Instagram, TikTok, YouTube, and other digital platforms.',
        outcome: 'Greater visibility, stronger engagement, and increased reader conversions.'
      },
      {
        title: 'Search Engine Optimization (SEO)',
        description: 'Social Media optimization, keyword implementation, technical SEO, and ongoing performance tracking.',
        outcome: 'Higher search rankings, increased organic traffic, and long-term discoverability.'
      }
    ]
  },
  {
    id: 'gold',
    name: 'Gold Marketing Plan',
    durationMonths: 12,
    price: 10499,
    features: [
      {
        title: 'Extended Publishing on 15 Platforms',
        description: 'Publish your book across 15 major platforms, reaching over 40,000 bookstores and libraries worldwide in eBook and paperback formats.',
        outcome: 'Greater visibility, wider audience reach, and increased sales opportunities.'
      },
      {
        title: 'Design Optimization & Creation',
        description: 'Professional banner designs, A/B testing, Author Central optimization, and A+ Content creation to maximize reader engagement.',
        outcome: 'Stronger branding, higher click-through rates, and improved conversions.'
      },
      {
        title: 'Test Marketing',
        description: 'Audience testing, reader feedback, market analysis, and pricing evaluation to refine your book\'s positioning before scaling.',
        outcome: 'Better targeting, stronger market positioning, and improved sales potential.'
      },
      {
        title: 'Social Media Presence & Credibility',
        description: 'Professional setup and optimization of your social media profiles with consistent branding and audience-building strategies.',
        outcome: 'Enhanced credibility, stronger online presence, and increased reader trust.'
      },
      {
        title: 'Social Media Marketing & Management',
        description: 'Content creation, audience engagement, targeted advertising, and campaign optimization across major social platforms.',
        outcome: 'Increased brand awareness, audience growth, and book sales.'
      },
      {
        title: 'Video Trailer Creation & Advertising (12 Months)',
        description: 'Custom book trailers promoted through Facebook, Instagram, TikTok, YouTube, and other digital platforms.',
        outcome: 'Greater visibility, stronger engagement, and increased reader conversions.'
      },
      {
        title: 'Search Engine Optimization (SEO)',
        description: 'Social Media optimization, keyword implementation, technical SEO, and ongoing performance tracking.',
        outcome: 'Higher search rankings, increased organic traffic, and long-term discoverability.'
      },
      {
        title: 'Monthly Sales Reports',
        description: 'Comprehensive monthly reports covering sales performance, marketing results, and audience growth.',
        outcome: 'Clear insights to measure progress and optimize future campaigns.'
      },
      {
        title: 'Google Knowledge Panel',
        description: 'Strengthen your online authority and eligibility for a Google Knowledge Panel through strategic branding and optimization.',
        outcome: 'Increased credibility, visibility, and author recognition.'
      },
      {
        title: 'Amazon Bestseller Campaign & Management',
        description: 'Amazon listing optimization, keyword strategy, advertising, category placement, and bestseller campaign management.',
        outcome: 'Higher rankings, increased visibility, and Guaranteed Amazon Best Seller Tag.'
      },
      {
        title: 'News Featured Publications, Guest Posts, and PR Campaigns',
        description: 'Strategic media exposure through articles, guest posts, press releases, and publicity campaigns to increase visibility and authority. Press release creation and distribution. Guest post opportunities on relevant websites and blogs. Media and publication outreach. Author feature articles and interviews. Brand awareness and reputation-building campaigns. Press Releases on more than 500 news channels including Fox News and NY Times.',
        outcome: 'Increased credibility, enhanced online presence, wider audience reach, and greater opportunities for book discovery and sales.'
      }
    ]
  }
];

export async function GET() {
  return NextResponse.json({ success: true, data: marketingPlans });
}

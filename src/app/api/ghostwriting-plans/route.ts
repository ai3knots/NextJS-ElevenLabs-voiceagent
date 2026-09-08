import { NextResponse } from 'next/server';
import { GhostwritingPlan } from '@/types/ghostwriting';

const ghostwritingPlans: GhostwritingPlan[] = [
  {
    id: 'ghostwriting-amazon',
    name: 'GHOSTWRITING + AMAZON PUBLISHING PLAN',
    price: 1099,
    process: [
      {
        step: 'Consultation',
        description: 'To begin with, we start off with a consultation call with an experienced book-writing consultant. During this call, they will attentively listen to your story, allowing them to conduct a thorough review.'
      },
      {
        step: 'Outline Creation',
        description: 'Within two business days following the consultation, they will craft a professional outline of your book, which will be sent to you for review.'
      },
      {
        step: 'Chapter Writing & Communication',
        description: 'Once you\'ve approved the outline, we proceed to the chapter writing phase, where we work methodically, chapter by chapter. You will have direct communication with our writing team, enabling you to discuss each chapter individually. Each chapter will be delivered to you within 3 to 4 business days.'
      },
      {
        step: 'Review & Feedback',
        description: 'Your role is to provide feedback to ensure that our writers are meeting your requirements and delivering the highest quality work.'
      },
      {
        step: 'Cover Design',
        description: 'While your book is in the writing phase, we will engage a graphic designer to create 3 to 4 book cover options based on your ideas. Your task will be to select the cover that aligns best with your vision, which will then be featured on your book.'
      },
      {
        step: 'Publishing & Release',
        description: 'Furthermore, once the editing and reviewing process is finalized, we will introduce you to our team of publishing experts. They will assist you in releasing your book on premium platforms.'
      },
      {
        step: 'Rights & Royalties',
        description: 'Importantly, we do not claim any credit or royalties for your work. The book will remain under your name from inception to completion of the project.'
      },
      {
        step: 'Support',
        description: 'Throughout the entire process, a dedicated project manager will be available to provide assistance at every step of the journey.'
      }
    ],
    features: [
      { title: 'Writing Pages (Up to 70-80 pages)' },
      { title: 'Meetings and discussions for the storyline.' },
      { title: 'Drafting chapters and reviewing' },
      { title: 'Professional Proofreading.' },
      { title: 'Editing and Refining the story' },
      { title: 'Layout Adjustment—Page Design.' },
      { title: 'Formatting—Structuring Content: eBook, Paperback & Hardcover.' },
      { title: 'Customized Cover Design (Front, spine and Back).' },
      { title: 'Unlimited Revisions - Making endless changes.' },
      { title: 'Authors Central Page.' },
      { title: 'Publication on Amazon' },
      { title: 'Multiple Book Formats- eBook and Paperback and Hardcover' },
      { title: 'Print on Demand Setup.' },
      { title: 'Premium ISBN and Barcode.' },
      { title: '100% Ownership Rights.' },
      { title: 'Dedicated Project Manager.' }
    ]
  }
];

export async function GET() {
  return NextResponse.json({ success: true, data: ghostwritingPlans });
}

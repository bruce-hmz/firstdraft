'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/next-intl';
import { Navbar } from '@/components/navigation/navbar';
import { MobileMenu } from '@/components/navigation/mobile-menu';
import { IdeaInputSection } from '@/components/sections/idea-input-section';
import { ExampleIdeas } from '@/components/sections/example-ideas';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { Sparkles, Zap, Clock, Share2, ArrowRight, Check, Globe, Wand2, Users } from 'lucide-react';

export default function Home() {
  const t = useTranslations();
  const [selectedIdea, setSelectedIdea] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const quickTags = [
    { icon: Sparkles, text: 'AI ' + t('home.feature1Title').split('，')[0] },
    { icon: Clock, text: '3min' },
    { icon: Globe, text: 'EN / 中文' },
    { icon: Users, text: t('auth.noAccount').split('?')[0] },
  ];

  const keyFeatures = [
    {
      icon: Zap,
      title: t('home.feature1Title').split('。')[0],
      description: t('home.feature1Description'),
    },
    {
      icon: Wand2,
      title: t('home.feature2Title').split('。')[0],
      description: t('home.feature2Description'),
    },
    {
      icon: Share2,
      title: t('home.feature3Title').split('。')[0],
      description: t('home.feature3Description'),
    },
  ];

  const stats = [
    { value: t('home.stats.value.10k'), label: t('home.stats.ideasGenerated') },
    { value: t('home.stats.value.3min'), label: t('home.stats.avgGenerationTime') },
    { value: t('home.stats.value.98'), label: t('home.stats.userSatisfaction') },
  ];

  const testimonials = [
    {
      quote: t('home.testimonials.items.0.quote'),
      author: t('home.testimonials.items.0.author'),
      avatar: t('home.testimonials.items.0.avatar'),
    },
    {
      quote: t('home.testimonials.items.1.quote'),
      author: t('home.testimonials.items.1.author'),
      avatar: t('home.testimonials.items.1.avatar'),
    },
    {
      quote: t('home.testimonials.items.2.quote'),
      author: t('home.testimonials.items.2.author'),
      avatar: t('home.testimonials.items.2.avatar'),
    },
  ];

  const faqs = [
    {
      question: t('home.faq.items.0.question'),
      answer: t('home.faq.items.0.answer'),
    },
    {
      question: t('home.faq.items.1.question'),
      answer: t('home.faq.items.1.answer'),
    },
    {
      question: t('home.faq.items.2.question'),
      answer: t('home.faq.items.2.answer'),
    },
    {
      question: t('home.faq.items.3.question'),
      answer: t('home.faq.items.3.answer'),
    },
  ];

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand/20 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[100px] opacity-50" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] opacity-40" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right,currentColor 1px,transparent 1px),linear-gradient(to bottom,currentColor 1px,transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <Navbar showBackButton={false} onBack={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Hero Section */}
      <section className="pt-24 pb-12 sm:pt-32 sm:pb-16 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            <span className="text-foreground">{t('home.title')}</span>
            <br />
            <span className="bg-gradient-to-r from-brand via-brand/80 to-purple-600 bg-clip-text text-transparent">{t('home.titleLine2')}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            {t('home.description')} {t('home.descriptionLine2')}
          </p>

          {/* Quick Tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {quickTags.map((tag, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border text-sm shadow-sm hover:shadow-md hover:border-brand/30 transition-all duration-300"
              >
                <tag.icon className="h-4 w-4 text-brand" />
                <span>{tag.text}</span>
              </div>
            ))}
          </div>

          {/* Idea Input */}
          <div className="relative">
            {/* Glow effect behind input */}
            <div className="absolute -inset-4 bg-gradient-to-r from-brand/10 via-purple-500/10 to-brand/10 rounded-3xl blur-2xl opacity-60" />
            <div className="relative">
              <IdeaInputSection key={selectedIdea} initialIdea={selectedIdea} />
            </div>
          </div>
        </div>
      </section>

      {/* Get Inspired Section */}
      <Section className="relative">
        {/* Section background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              {t('home.exampleTitle')}
            </h2>
            <p className="text-muted-foreground">
              {t('home.exampleDescription')}
            </p>
          </div>
          <ExampleIdeas onSelectIdea={setSelectedIdea} />
        </div>
      </Section>

      {/* Key Features Section */}
      <Section className="relative">
        {/* Background decoration */}
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-brand/5 rounded-full blur-[100px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-purple-500/5 rounded-full blur-[100px] -translate-y-1/2" />

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              {t('home.feature1Title').split('。')[0]}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.feature1Description')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {keyFeatures.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-brand/40 hover:shadow-xl hover:shadow-brand/5 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-brand/20 to-brand/5 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-6 w-6 text-brand" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Stats Section */}
      <Section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-background to-purple-500/5" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand/10 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2" />

        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              {t('home.stats.title')}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50"
              >
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-brand to-brand/70 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Testimonials Section */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              {t('home.testimonials.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('home.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <div className="text-3xl mb-4">{testimonial.avatar}</div>
                <p className="text-foreground mb-4 leading-relaxed text-sm">
                  "{testimonial.quote}"
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  — {testimonial.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section className="bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              {t('home.faq.title')}
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-card border border-border"
              >
                <h3 className="font-semibold mb-2 flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  {faq.question}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed pl-9">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand/5 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand/20 rounded-full blur-[150px] opacity-50" />

        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            {t('home.cta.subtitle')}
          </p>
          <Button
            size="lg"
            className="gap-2 px-8 shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 hover:scale-105 transition-all duration-300"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Sparkles className="h-5 w-5" />
            {t('home.cta.button') || (t('home.cta.title').includes('Ready') ? 'Get Started' : '立即开始')}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            {t('home.footer')}
          </p>
        </div>
      </footer>
    </main>
  );
}

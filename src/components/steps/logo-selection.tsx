'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/lib/next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, Check } from 'lucide-react';

interface Logo {
  id: number;
  url: string;
  prompt: string;
}

interface LogoSelectionProps {
  productName: string;
  onLogoSelect: (logoUrl: string) => void;
}

export function LogoSelection({ productName, onLogoSelect }: LogoSelectionProps) {
  const t = useTranslations();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);

  useEffect(() => {
    generateLogos();
  }, [productName]);

  const generateLogos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productName }),
      });

      const data = await response.json();
      if (data.success) {
        setLogos(data.data.logos);
      } else {
        setError(data.error || 'Failed to generate logos');
      }
    } catch (error) {
      setError('Failed to generate logos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoSelect = (logoUrl: string) => {
    setSelectedLogo(logoUrl);
    onLogoSelect(logoUrl);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-neutral-600">{t('result.generating')} Logos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={generateLogos} variant="outline">
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
          {t('result.logoSelection')}
        </h3>
        <p className="text-neutral-600 mb-6">
          {t('result.logoSelectionDescription')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {logos.map((logo) => (
          <motion.div
            key={logo.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`p-4 border-2 cursor-pointer transition-all ${selectedLogo === logo.url ? 'border-blue-500 shadow-lg' : 'border-neutral-200 hover:border-neutral-300'}`}
              onClick={() => handleLogoSelect(logo.url)}
            >
              <div className="aspect-square bg-neutral-50 rounded-md overflow-hidden flex items-center justify-center mb-4">
                <img
                  src={logo.url}
                  alt={`Logo ${logo.id} for ${productName}`}
                  className="w-full h-full object-contain"
                />
              </div>
              {selectedLogo === logo.url && (
                <div className="flex items-center justify-center mt-2">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-green-600">{t('common.selected')}</span>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={generateLogos}>
          {t('result.generateMoreLogos')}
        </Button>
      </div>
    </div>
  );
}

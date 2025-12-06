import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

/**
 * Hook para carregar e aplicar configurações do site dinamicamente
 * Atualiza CSS variables, meta tags, favicon, etc
 */
export function useSiteSettings() {
  const { data: settings, isLoading } = trpc.cms.getSettings.useQuery();

  useEffect(() => {
    if (!settings) return;

    // Aplicar cores como CSS variables
    const root = document.documentElement;
    
    if (settings.primary_color) {
      root.style.setProperty('--color-primary', settings.primary_color);
    }
    
    if (settings.secondary_color) {
      root.style.setProperty('--color-secondary', settings.secondary_color);
    }
    
    if (settings.accent_color) {
      root.style.setProperty('--color-accent', settings.accent_color);
    }
    
    if (settings.background_color) {
      root.style.setProperty('--color-background', settings.background_color);
    }
    
    if (settings.text_color) {
      root.style.setProperty('--color-text', settings.text_color);
    }

    // Aplicar fontes
    if (settings.font_family) {
      root.style.setProperty('--font-body', settings.font_family);
    }
    
    if (settings.heading_font) {
      root.style.setProperty('--font-heading', settings.heading_font);
    }
    
    if (settings.font_size_base) {
      root.style.setProperty('--font-size-base', settings.font_size_base);
    }

    // Atualizar meta tags
    if (settings.meta_title) {
      document.title = settings.meta_title;
    }
    
    if (settings.meta_description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', settings.meta_description);
    }
    
    if (settings.meta_keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', settings.meta_keywords);
    }

    // Atualizar favicon
    if (settings.favicon_url) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = settings.favicon_url;
    }

    // Injetar CSS customizado
    if (settings.custom_css) {
      let customStyle = document.getElementById('custom-css');
      if (!customStyle) {
        customStyle = document.createElement('style');
        customStyle.id = 'custom-css';
        document.head.appendChild(customStyle);
      }
      customStyle.textContent = settings.custom_css;
    }

    // Injetar JS customizado (com cuidado!)
    if (settings.custom_js) {
      let customScript = document.getElementById('custom-js');
      if (!customScript) {
        customScript = document.createElement('script');
        customScript.id = 'custom-js';
        document.body.appendChild(customScript);
      }
      customScript.textContent = settings.custom_js;
    }

    // Google Analytics
    if (settings.google_analytics_id) {
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${settings.google_analytics_id}');
      `;
      document.head.appendChild(script2);
    }

    // Google Tag Manager
    if (settings.google_tag_manager_id) {
      const script = document.createElement('script');
      script.textContent = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${settings.google_tag_manager_id}');
      `;
      document.head.appendChild(script);
    }

    // Facebook Pixel
    if (settings.facebook_pixel_id) {
      const script = document.createElement('script');
      script.textContent = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${settings.facebook_pixel_id}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }

  }, [settings]);

  return { settings, isLoading };
}

/**
 * Hook para obter configurações específicas
 */
export function useSiteConfig() {
  const { data: settings } = trpc.cms.getSettings.useQuery();

  return {
    companyName: settings?.company_name || 'CasaDF',
    companySlogan: settings?.company_slogan || '',
    logoUrl: settings?.logo_url || '',
    logoDarkUrl: settings?.logo_dark_url || '',
    phone: settings?.phone || '',
    whatsapp: settings?.whatsapp || '',
    email: settings?.email || '',
    address: settings?.address || '',
    city: settings?.city || '',
    state: settings?.state || '',
    facebookUrl: settings?.facebook_url || '',
    instagramUrl: settings?.instagram_url || '',
    linkedinUrl: settings?.linkedin_url || '',
    youtubeUrl: settings?.youtube_url || '',
    twitterUrl: settings?.twitter_url || '',
    primaryColor: settings?.primary_color || '#2563eb',
    secondaryColor: settings?.secondary_color || '#7c3aed',
    accentColor: settings?.accent_color || '#f59e0b',
  };
}

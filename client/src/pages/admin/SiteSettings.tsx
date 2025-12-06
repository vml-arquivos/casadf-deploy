import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Palette, Building2, Phone, Globe, Code } from "lucide-react";

export default function SiteSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const { data: settings, isLoading, refetch } = trpc.cms.getSettings.useQuery();
  const updateSettings = trpc.cms.updateSettings.useMutation();

  const [formData, setFormData] = useState({
    companyName: "",
    companySlogan: "",
    companyDescription: "",
    logoUrl: "",
    logoDarkUrl: "",
    faviconUrl: "",
    primaryColor: "#2563eb",
    secondaryColor: "#7c3aed",
    accentColor: "#f59e0b",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    fontFamily: "Inter, sans-serif",
    headingFont: "Inter, sans-serif",
    fontSizeBase: "16px",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    facebookUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
    twitterUrl: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    googleAnalyticsId: "",
    googleTagManagerId: "",
    facebookPixelId: "",
    customCss: "",
    customJs: "",
    maintenanceMode: false,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.company_name || "",
        companySlogan: settings.company_slogan || "",
        companyDescription: settings.company_description || "",
        logoUrl: settings.logo_url || "",
        logoDarkUrl: settings.logo_dark_url || "",
        faviconUrl: settings.favicon_url || "",
        primaryColor: settings.primary_color || "#2563eb",
        secondaryColor: settings.secondary_color || "#7c3aed",
        accentColor: settings.accent_color || "#f59e0b",
        backgroundColor: settings.background_color || "#ffffff",
        textColor: settings.text_color || "#1f2937",
        fontFamily: settings.font_family || "Inter, sans-serif",
        headingFont: settings.heading_font || "Inter, sans-serif",
        fontSizeBase: settings.font_size_base || "16px",
        phone: settings.phone || "",
        whatsapp: settings.whatsapp || "",
        email: settings.email || "",
        address: settings.address || "",
        city: settings.city || "",
        state: settings.state || "",
        zipCode: settings.zip_code || "",
        facebookUrl: settings.facebook_url || "",
        instagramUrl: settings.instagram_url || "",
        linkedinUrl: settings.linkedin_url || "",
        youtubeUrl: settings.youtube_url || "",
        twitterUrl: settings.twitter_url || "",
        metaTitle: settings.meta_title || "",
        metaDescription: settings.meta_description || "",
        metaKeywords: settings.meta_keywords || "",
        googleAnalyticsId: settings.google_analytics_id || "",
        googleTagManagerId: settings.google_tag_manager_id || "",
        facebookPixelId: settings.facebook_pixel_id || "",
        customCss: settings.custom_css || "",
        customJs: settings.custom_js || "",
        maintenanceMode: settings.maintenance_mode || false,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateSettings.mutateAsync(formData);
      toast({
        title: "Sucesso!",
        description: "Configurações salvas com sucesso.",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurações do Site</h1>
        <p className="text-muted-foreground">
          Personalize a identidade visual e informações do seu site
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="identity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="identity">
              <Building2 className="w-4 h-4 mr-2" />
              Identidade
            </TabsTrigger>
            <TabsTrigger value="colors">
              <Palette className="w-4 h-4 mr-2" />
              Cores
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Phone className="w-4 h-4 mr-2" />
              Contato
            </TabsTrigger>
            <TabsTrigger value="social">
              <Globe className="w-4 h-4 mr-2" />
              Redes Sociais
            </TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="advanced">
              <Code className="w-4 h-4 mr-2" />
              Avançado
            </TabsTrigger>
          </TabsList>

          {/* IDENTIDADE */}
          <TabsContent value="identity">
            <Card>
              <CardHeader>
                <CardTitle>Identidade da Empresa</CardTitle>
                <CardDescription>
                  Configure o nome, logo e slogan da sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Nome da Empresa *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="companySlogan">Slogan</Label>
                  <Input
                    id="companySlogan"
                    value={formData.companySlogan}
                    onChange={(e) => setFormData({ ...formData, companySlogan: e.target.value })}
                    placeholder="Ex: Seu sonho, nossa missão"
                  />
                </div>

                <div>
                  <Label htmlFor="companyDescription">Descrição</Label>
                  <Textarea
                    id="companyDescription"
                    value={formData.companyDescription}
                    onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                    rows={4}
                    placeholder="Descreva sua empresa..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="logoUrl">URL do Logo</Label>
                    <Input
                      id="logoUrl"
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="logoDarkUrl">Logo (Modo Escuro)</Label>
                    <Input
                      id="logoDarkUrl"
                      type="url"
                      value={formData.logoDarkUrl}
                      onChange={(e) => setFormData({ ...formData, logoDarkUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="faviconUrl">Favicon</Label>
                    <Input
                      id="faviconUrl"
                      type="url"
                      value={formData.faviconUrl}
                      onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CORES */}
          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle>Paleta de Cores</CardTitle>
                <CardDescription>
                  Personalize as cores do seu site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-20"
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondaryColor">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-20"
                      />
                      <Input
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        placeholder="#7c3aed"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accentColor">Cor de Destaque</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                        className="w-20"
                      />
                      <Input
                        value={formData.accentColor}
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                        placeholder="#f59e0b"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="backgroundColor">Cor de Fundo</Label>
                    <div className="flex gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="w-20"
                      />
                      <Input
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="textColor">Cor do Texto</Label>
                    <div className="flex gap-2">
                      <Input
                        id="textColor"
                        type="color"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        className="w-20"
                      />
                      <Input
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        placeholder="#1f2937"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-4">Tipografia</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="fontFamily">Fonte do Corpo</Label>
                      <Input
                        id="fontFamily"
                        value={formData.fontFamily}
                        onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
                        placeholder="Inter, sans-serif"
                      />
                    </div>

                    <div>
                      <Label htmlFor="headingFont">Fonte dos Títulos</Label>
                      <Input
                        id="headingFont"
                        value={formData.headingFont}
                        onChange={(e) => setFormData({ ...formData, headingFont: e.target.value })}
                        placeholder="Inter, sans-serif"
                      />
                    </div>

                    <div>
                      <Label htmlFor="fontSizeBase">Tamanho Base</Label>
                      <Input
                        id="fontSizeBase"
                        value={formData.fontSizeBase}
                        onChange={(e) => setFormData({ ...formData, fontSizeBase: e.target.value })}
                        placeholder="16px"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTATO */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
                <CardDescription>
                  Configure telefone, email e endereço
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(61) 99999-9999"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="5561999999999"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contato@empresa.com.br"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Rua, número, complemento"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Brasília"
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="DF"
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      placeholder="70000-000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REDES SOCIAIS */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Redes Sociais</CardTitle>
                <CardDescription>
                  Configure os links das suas redes sociais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="facebookUrl">Facebook</Label>
                  <Input
                    id="facebookUrl"
                    type="url"
                    value={formData.facebookUrl}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="instagramUrl">Instagram</Label>
                  <Input
                    id="instagramUrl"
                    type="url"
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>

                <div>
                  <Label htmlFor="youtubeUrl">YouTube</Label>
                  <Input
                    id="youtubeUrl"
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="twitterUrl">Twitter / X</Label>
                  <Input
                    id="twitterUrl"
                    type="url"
                    value={formData.twitterUrl}
                    onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO e Analytics</CardTitle>
                <CardDescription>
                  Configure metadados e ferramentas de análise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Título (Meta Title)</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="Título que aparece no Google"
                  />
                </div>

                <div>
                  <Label htmlFor="metaDescription">Descrição (Meta Description)</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    rows={3}
                    placeholder="Descrição que aparece no Google"
                  />
                </div>

                <div>
                  <Label htmlFor="metaKeywords">Palavras-chave</Label>
                  <Input
                    id="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                    placeholder="imóveis, brasília, apartamentos"
                  />
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-4">Ferramentas de Análise</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                      <Input
                        id="googleAnalyticsId"
                        value={formData.googleAnalyticsId}
                        onChange={(e) => setFormData({ ...formData, googleAnalyticsId: e.target.value })}
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>

                    <div>
                      <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
                      <Input
                        id="googleTagManagerId"
                        value={formData.googleTagManagerId}
                        onChange={(e) => setFormData({ ...formData, googleTagManagerId: e.target.value })}
                        placeholder="GTM-XXXXXXX"
                      />
                    </div>

                    <div>
                      <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                      <Input
                        id="facebookPixelId"
                        value={formData.facebookPixelId}
                        onChange={(e) => setFormData({ ...formData, facebookPixelId: e.target.value })}
                        placeholder="XXXXXXXXXXXXXXXX"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AVANÇADO */}
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Avançadas</CardTitle>
                <CardDescription>
                  CSS e JavaScript customizados (use com cuidado)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customCss">CSS Customizado</Label>
                  <Textarea
                    id="customCss"
                    value={formData.customCss}
                    onChange={(e) => setFormData({ ...formData, customCss: e.target.value })}
                    rows={8}
                    placeholder=".my-class { color: red; }"
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="customJs">JavaScript Customizado</Label>
                  <Textarea
                    id="customJs"
                    value={formData.customJs}
                    onChange={(e) => setFormData({ ...formData, customJs: e.target.value })}
                    rows={8}
                    placeholder="console.log('Hello');"
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

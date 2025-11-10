import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Edit, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PvzLocation {
  id: string;
  name: string;
  address: string;
  china_warehouse_address: string;
}

const AdminSettings = () => {
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#10b981");
  const [pricePerKg, setPricePerKg] = useState("12.00");
  const [loading, setLoading] = useState(true);
  const [pvzLocations, setPvzLocations] = useState<PvzLocation[]>([]);
  const [editingPvz, setEditingPvz] = useState<PvzLocation | null>(null);
  const [isAddingPvz, setIsAddingPvz] = useState(false);
  const [contactTelegram, setContactTelegram] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
    fetchPvzLocations();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("settings")
      .select("*")
      .maybeSingle();

    if (data) {
      setLogoUrl(data.logo_url || "");
      setPrimaryColor(data.primary_color || "#10b981");
      setPricePerKg(data.price_per_kg?.toString() || "12.00");
      setContactTelegram(data.contact_telegram || "");
      setContactWhatsapp(data.contact_whatsapp || "");
      setContactEmail(data.contact_email || "");
      setContactPhone(data.contact_phone || "");
    }
    setLoading(false);
  };

  const fetchPvzLocations = async () => {
    const { data, error } = await supabase
      .from("pvz_locations")
      .select("*")
      .order("id");

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить ПВЗ",
        variant: "destructive",
      });
    } else {
      setPvzLocations(data || []);
    }
  };

  const handleSave = async () => {
    const { data: existingSettings } = await supabase
      .from("settings")
      .select("id")
      .maybeSingle();

    const settingsData = {
      logo_url: logoUrl,
      primary_color: primaryColor,
      price_per_kg: parseFloat(pricePerKg),
      contact_telegram: contactTelegram,
      contact_whatsapp: contactWhatsapp,
      contact_email: contactEmail,
      contact_phone: contactPhone,
    };

    if (existingSettings) {
      const { error } = await supabase
        .from("settings")
        .update(settingsData)
        .eq("id", existingSettings.id);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось сохранить настройки",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Успешно",
          description: "Изменения сохранены успешно",
        });
      }
    } else {
      const { error } = await supabase
        .from("settings")
        .insert(settingsData);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось сохранить настройки",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Успешно",
          description: "Изменения сохранены успешно",
        });
      }
    }
  };

  const handleSavePvz = async (pvz: PvzLocation) => {
    const { error } = await supabase
      .from("pvz_locations")
      .upsert(pvz);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить ПВЗ",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: "Изменения сохранены успешно",
      });
      fetchPvzLocations();
      setEditingPvz(null);
      setIsAddingPvz(false);
    }
  };

  const handleDeletePvz = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот ПВЗ?")) return;

    const { error } = await supabase
      .from("pvz_locations")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить ПВЗ",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: "ПВЗ удалён",
      });
      fetchPvzLocations();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Основные настройки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Настройки приложения
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL логотипа</Label>
            <Input
              id="logoUrl"
              type="url"
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Введите ссылку на изображение логотипа
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryColor">Основной цвет</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#10b981"
                className="max-w-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricePerKg">Цена за килограмм (сом)</Label>
            <Input
              id="pricePerKg"
              type="number"
              step="0.01"
              value={pricePerKg}
              onChange={(e) => setPricePerKg(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Контактная информация</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Telegram</Label>
                <Input 
                  placeholder="@abucargo" 
                  value={contactTelegram}
                  onChange={(e) => setContactTelegram(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input 
                  placeholder="+996 XXX XXX XXX"
                  value={contactWhatsapp}
                  onChange={(e) => setContactWhatsapp(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  placeholder="info@abucargo.kg"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Телефон</Label>
                <Input 
                  type="tel" 
                  placeholder="+996 XXX XXX XXX"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full" size="lg">
            Сохранить настройки
          </Button>
        </CardContent>
      </Card>

      {/* Управление ПВЗ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Управление ПВЗ</CardTitle>
            <Button onClick={() => setIsAddingPvz(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить ПВЗ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Адрес</TableHead>
                <TableHead>Адрес склада в Китае</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pvzLocations.map((pvz) => (
                <TableRow key={pvz.id}>
                  <TableCell className="font-mono">{pvz.id}</TableCell>
                  <TableCell>{pvz.name}</TableCell>
                  <TableCell>{pvz.address}</TableCell>
                  <TableCell className="max-w-xs truncate">{pvz.china_warehouse_address}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPvz(pvz)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Изменить
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePvz(pvz.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Диалог редактирования/добавления ПВЗ */}
      <PvzDialog
        pvz={editingPvz}
        isOpen={!!editingPvz || isAddingPvz}
        onClose={() => {
          setEditingPvz(null);
          setIsAddingPvz(false);
        }}
        onSave={handleSavePvz}
      />
    </div>
  );
};

// Компонент диалога для редактирования/добавления ПВЗ
function PvzDialog({
  pvz,
  isOpen,
  onClose,
  onSave,
}: {
  pvz: PvzLocation | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pvz: PvzLocation) => void;
}) {
  const [formData, setFormData] = useState<PvzLocation>({
    id: "",
    name: "",
    address: "",
    china_warehouse_address: "",
  });

  useEffect(() => {
    if (pvz) {
      setFormData(pvz);
    } else {
      setFormData({
        id: "",
        name: "",
        address: "",
        china_warehouse_address: "",
      });
    }
  }, [pvz, isOpen]);

  const handleSubmit = () => {
    if (!formData.id || !formData.name || !formData.address || !formData.china_warehouse_address) {
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {pvz ? "Редактировать ПВЗ" : "Добавить новый ПВЗ"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pvz-id">ID (например: YX, JL)</Label>
            <Input
              id="pvz-id"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
              placeholder="YX"
              disabled={!!pvz}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pvz-name">Название ПВЗ</Label>
            <Input
              id="pvz-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Жийдалик"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pvz-address">Адрес</Label>
            <Input
              id="pvz-address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="УПТК Наби Кожо 61Б"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pvz-china">Адрес склада в Китае</Label>
            <Input
              id="pvz-china"
              value={formData.china_warehouse_address}
              onChange={(e) => setFormData({ ...formData, china_warehouse_address: e.target.value })}
              placeholder="浙江省金华市义乌市..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AdminSettings;

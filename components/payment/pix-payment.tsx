"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { QrCode } from "lucide-react";
import { useState } from "react";
import QRCode from "qrcode.react";

interface PixPaymentProps {
  amount: number;
  description: string;
  customer: {
    name: string;
    email: string;
    cpf?: string;
  };
  onSuccess?: () => void;
}

export default function PixPayment({
  amount,
  description,
  customer,
  onSuccess,
}: PixPaymentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const { toast } = useToast();

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/payment/pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          description,
          customer,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar pagamento PIX");
      }

      const data = await response.json();
      setPixData(data.pix_payload);
      setIsOpen(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPixCode = () => {
    if (pixData?.copy_paste) {
      navigator.clipboard.writeText(pixData.copy_paste);
      toast({
        title: "Código PIX copiado",
        description: "Cole o código no seu aplicativo do banco",
      });
    }
  };

  return (
    <>
      <Button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full gap-2"
      >
        <QrCode className="h-4 w-4" />
        {isLoading ? "Gerando PIX..." : "Pagar com PIX"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pagamento via PIX</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code ou copie o código PIX para pagar
            </DialogDescription>
          </DialogHeader>
          
          {pixData && (
            <div className="grid gap-6">
              <div className="flex justify-center">
                <QRCode value={pixData.qr_code} size={200} />
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyPixCode}
              >
                Copiar Código PIX
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Após o pagamento, você receberá a confirmação por e-mail
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
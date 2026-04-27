import { useState } from 'react';
import { TextInput, Paper, Title, Button, Box } from '@mantine/core';
import { IconPhone } from '@tabler/icons-react';
import { resolveRoleFromPhone } from '../auth/phoneRoles';
import { useAuth } from '../context/AuthContext';

const UA_CC = '380';

/** Національна частина (до 9 цифр) з довільного вводу / вставки */
function extractNationalDigits(input: string): string {
  let d = input.replace(/\D/g, '');
  if (!d) return '';
  if (d.length === 11 && d.startsWith('80')) {
    d = '3' + d;
  }
  if (d.startsWith('380')) {
    return d.slice(3, 12);
  }
  if (d.startsWith('0')) {
    return d.slice(1, 10);
  }
  if (d.length < UA_CC.length && UA_CC.startsWith(d)) {
    return '';
  }
  return d.slice(0, 9);
}

/** Відображення національної частини: +380 XX XXX XX XX (national.length ≥ 1) */
function formatUaPhoneDisplay(national: string): string {
  const n = national.slice(0, 9);
  let s = '+380';
  s += ' ' + n.slice(0, Math.min(2, n.length));
  if (n.length <= 2) return s;
  s += ' ' + n.slice(2, Math.min(5, n.length));
  if (n.length <= 5) return s;
  s += ' ' + n.slice(5, Math.min(7, n.length));
  if (n.length <= 7) return s;
  s += ' ' + n.slice(7, 9);
  return s;
}

/** Форматований рядок поля з сирого вводу (вставка, 0XX, лише 9 цифр тощо) */
function formatUaPhoneInput(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (!d) return '';
  const national = extractNationalDigits(raw);
  if (national.length > 0) {
    return formatUaPhoneDisplay(national);
  }
  if (UA_CC.startsWith(d) && d.length < UA_CC.length) {
    return '+' + d;
  }
  if (d === '380') {
    return '+380';
  }
  return '';
}

function normalizeUaPhone(raw: string): string | null {
  const national = extractNationalDigits(raw);
  if (national.length !== 9) {
    return null;
  }
  const d = UA_CC + national;
  if (d.length === 12 && d.startsWith('380')) {
    return `+${d}`;
  }
  return null;
}

export function AuthPage() {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const normalized = normalizeUaPhone(phone);
    if (!normalized) {
      setError('Введіть коректний український номер телефону');
      return;
    }
    const role = resolveRoleFromPhone(normalized);
    if (!role) {
      setError('Немає доступу для цього номера');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login({ phone: normalized, role });
    }, 600);
  };

  return (
    <div
      className="relative min-h-dvh w-full flex flex-col bg-white text-[#1a1d21]"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 min-h-dvh"
        aria-hidden
        style={{
          background:
            'linear-gradient(165deg, rgba(102,191,255,0.14) 0%, rgba(232,246,255,0.9) 45%, #f6f9fc 78%, #ffffff 100%)',
        }}
      />

      <Box className="relative z-10 min-h-dvh w-full">
        <div className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-5">
          <div className="relative w-full">
            <div className="absolute bottom-full left-0 right-0 z-20 mb-5 flex flex-col items-center">
              <img
                src="/logo-chatbullet.png"
                alt="ChatBullet — логотип"
                className="h-auto w-[min(100%,280px)] shrink-0 object-contain"
                width={280}
                height={90}
              />
            </div>

            <Paper
              shadow="sm"
              p={{ base: 'lg', xs: 'xl' }}
              radius="lg"
              className="w-full border border-slate-200/90 bg-white shadow-[0_8px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm"
            >
              <Title
                order={1}
                className="text-[#1a1d21] mb-1 text-center text-xl font-bold leading-snug tracking-tight"
                style={{ fontFamily: '"Montserrat", "Roboto", sans-serif' }}
              >
                Вхід
              </Title>

              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-6">
                <TextInput
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  label="Номер телефону"
                  placeholder="+380 99 999 99 99"
                  value={phone}
                  maxLength={17}
                  onChange={(e) => {
                    setPhone(formatUaPhoneInput(e.currentTarget.value));
                    setError(null);
                  }}
                  leftSection={<IconPhone size={18} className="text-[#66BFFF]" />}
                  error={error}
                  size="md"
                  classNames={{
                    label: 'text-[#1a1d21] font-medium text-sm mb-1.5',
                    input:
                      'min-h-12 text-base rounded-lg border-slate-200 bg-white focus:border-[#66BFFF] data-[error]:border-red-400',
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  loading={isLoading}
                  size="md"
                  className="min-h-12 text-base font-semibold rounded-lg border-0 shadow-md"
                  styles={{
                    root: {
                      background: 'linear-gradient(135deg, #8ED4FF 0%, #66BFFF 50%, #4AA3E8 100%)',
                      boxShadow: '0 8px 28px rgba(102, 191, 255, 0.45)',
                    },
                  }}
                >
                  Увійти
                </Button>

                {/* <Text size="xs" className="text-[#8a8580] text-center leading-snug">
                  Натискаючи «Увійти», ви погоджуєтесь на обробку персональних даних.
                </Text> */}
              </form>
            </Paper>
          </div>
        </div>
      </Box>
    </div>
  );
}

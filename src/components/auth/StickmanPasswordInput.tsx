import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StickmanPasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  id?: string;
}

export function StickmanPasswordInput({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = 'Password',
  id = 'password',
}: StickmanPasswordInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const stickmanRef = useRef<SVGSVGElement>(null);
  const headGroupRef = useRef<SVGGElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const MAX_X_LOOK = 20;
  const MAX_Y_LEAN = 15;

  useEffect(() => {
    const stickman = stickmanRef.current;
    const headGroup = headGroupRef.current;
    const passwordInput = passwordInputRef.current;

    if (!stickman || !headGroup || !passwordInput) return;

    const updateStickman = () => {
      const isPasswordHidden = passwordInput.getAttribute('type') === 'password';
      const isFocused = document.activeElement === passwordInput;

      // Сброс классов
      stickman.classList.remove('blind');
      stickman.classList.remove('peek');

      // Сброс трансформации головы (возврат в центр)
      if (!isFocused || isPasswordHidden) {
        headGroup.style.transform = `translate(0px, 0px) rotate(0deg)`;
      }

      if (isFocused) {
        if (isPasswordHidden) {
          // 1. Пароль скрыт -> Закрываем глаза
          stickman.classList.add('blind');
        } else {
          // 2. Пароль открыт -> Подглядываем
          stickman.classList.add('peek');
          trackInputLength(); // Сразу позиционируем голову
        }
      }
    };

    // Функция слежения за длиной текста
    const trackInputLength = () => {
      // Если не в режиме подглядывания, выходим
      if (!stickman.classList.contains('peek')) return;

      const length = passwordInput.value.length;
      // Ограничиваем длину трекинга (например, до 20 символов)
      const cappedLength = Math.min(length, 25);

      // Вычисляем процент (0..1)
      const progress = cappedLength / 25;

      // Смещение по X: от -10 (слева) до +10 (справа)
      // Начинаем чуть левее центра (-10px), заканчиваем правее
      const moveX = (progress * (MAX_X_LOOK * 2)) - MAX_X_LOOK;

      // Наклон вниз (Y): чем больше пишем, тем ниже/ближе наклоняется
      // Начинаем с 5px, опускаемся до MAX_Y_LEAN
      const moveY = 5 + (progress * 5);

      // Легкий поворот головы для естественности
      const rotate = moveX * 0.5;

      headGroup.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotate}deg)`;
    };

    // Слушатели событий
    passwordInput.addEventListener('focus', updateStickman);

    passwordInput.addEventListener('blur', () => {
      stickman.classList.remove('blind');
      stickman.classList.remove('peek');
      // Возвращаем голову на место
      headGroup.style.transform = `translate(0px, 0px)`;
      onBlur?.();
    });

    passwordInput.addEventListener('input', trackInputLength);

    updateStickman();

    return () => {
      passwordInput.removeEventListener('focus', updateStickman);
      passwordInput.removeEventListener('blur', () => {});
      passwordInput.removeEventListener('input', trackInputLength);
    };
  }, [isPasswordVisible, value, onBlur]);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="input-group">
      <Label htmlFor={id}>Password</Label>
      <div className="relative">
        <Input
          ref={passwordInputRef}
          id={id}
          type={isPasswordVisible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          placeholder={placeholder}
          className="pr-10"
        />
        <span
          className="toggle-btn"
          onClick={togglePasswordVisibility}
        >
          {isPasswordVisible ? '❌' : '👁️'}
        </span>
      </div>

      <style>{`
        .input-group {
          margin-bottom: 15px;
          position: relative;
          text-align: left;
        }

        .toggle-btn {
          position: absolute;
          right: 12px;
          top: 40px;
          cursor: pointer;
          font-size: 20px;
          user-select: none;
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        .toggle-btn:hover {
          opacity: 1;
        }

        .stickman-svg {
          width: 220px;
          height: 200px;
          margin-bottom: -15px;
          overflow: visible;
          z-index: 5;
        }

        .stickman-svg .draw {
          fill: none;
          stroke: #333;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-linejoin: round;
          transition: d 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .stickman-svg .head-fill {
          fill: #fff;
          stroke-width: 4;
          stroke: #333;
        }

        .stickman-svg .eye {
          fill: #333;
          stroke: none;
        }

        .stickman-svg .hand-circle {
          fill: #fff;
          stroke: #333;
          stroke-width: 4;
          r: 0;
          transition: all 0.3s ease;
        }

        .stickman-svg #head-group {
          transform-box: fill-box;
          transform-origin: center bottom;
          transition: transform 0.2s ease-out;
        }

        /* 1. BLIND (Закрыл глаза) */
        .stickman-svg.blind .hand-circle {
          r: 12;
        }

        .stickman-svg.blind #armL {
          d: path("M 100 110 C 80 110, 40 80, 88 65");
        }

        .stickman-svg.blind #armR {
          d: path("M 100 110 C 120 110, 160 80, 112 65");
        }

        .stickman-svg.blind #handL-circle {
          cx: 88;
          cy: 65;
        }

        .stickman-svg.blind #handR-circle {
          cx: 112;
          cy: 65;
        }

        /* 2. PEEK (Смотрит за вводом) */
        .stickman-svg.peek .eye {
          r: 4.5;
          transition: r 0.2s;
        }
      `}</style>
    </div>
  );
}

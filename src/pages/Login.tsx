import { useState, FormEvent, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import logger from '@/lib/logger';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const stickmanRef = useRef<SVGSVGElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const MAX_X_LOOK = 20;
  const MAX_Y_LEAN = 15;

  useEffect(() => {
    const stickman = stickmanRef.current;
    const passwordInput = passwordInputRef.current;
    const headGroup = document.getElementById('head-group');

    if (!stickman || !passwordInput || !headGroup) return;

    const updateStickman = () => {
      const isPasswordHidden = passwordInput.getAttribute('type') === 'password';
      const isFocused = document.activeElement === passwordInput;
      const armL = document.getElementById('armL');
      const armR = document.getElementById('armR');
      const handLCircle = document.getElementById('handL-circle');
      const handRCircle = document.getElementById('handR-circle');
      const eyes = document.querySelectorAll('#stickman .eye');

      // Сброс классов
      stickman.classList.remove('blind');
      stickman.classList.remove('peek');

      // Сброс трансформации головы и рук
      if (!isFocused || isPasswordHidden) {
        headGroup.style.transform = `translate(0px, 0px) rotate(0deg)`;
        if (armL) armL.setAttribute('d', 'M 100 110 C 80 110, 50 150, 50 150');
        if (armR) armR.setAttribute('d', 'M 100 110 C 120 110, 150 150, 150 150');
        if (handLCircle) {
          handLCircle.setAttribute('r', '0');
          handLCircle.setAttribute('cx', '50');
          handLCircle.setAttribute('cy', '150');
        }
        if (handRCircle) {
          handRCircle.setAttribute('r', '0');
          handRCircle.setAttribute('cx', '150');
          handRCircle.setAttribute('cy', '150');
        }
        eyes.forEach(eye => eye.setAttribute('r', '3.5'));
      }

      if (isFocused) {
        if (isPasswordHidden) {
          // 1. Пароль скрыт -> Закрываем глаза
          stickman.classList.add('blind');
          if (armL) armL.setAttribute('d', 'M 100 110 C 80 110, 40 80, 88 65');
          if (armR) armR.setAttribute('d', 'M 100 110 C 120 110, 160 80, 112 65');
          if (handLCircle) {
            handLCircle.setAttribute('r', '12');
            handLCircle.setAttribute('cx', '88');
            handLCircle.setAttribute('cy', '65');
          }
          if (handRCircle) {
            handRCircle.setAttribute('r', '12');
            handRCircle.setAttribute('cx', '112');
            handRCircle.setAttribute('cy', '65');
          }
        } else {
          // 2. Пароль открыт -> Подглядываем
          stickman.classList.add('peek');
          if (armL) armL.setAttribute('d', 'M 100 110 C 80 110, 50 150, 50 150');
          if (armR) armR.setAttribute('d', 'M 100 110 C 120 110, 150 150, 150 150');
          if (handLCircle) {
            handLCircle.setAttribute('r', '0');
            handLCircle.setAttribute('cx', '50');
            handLCircle.setAttribute('cy', '150');
          }
          if (handRCircle) {
            handRCircle.setAttribute('r', '0');
            handRCircle.setAttribute('cx', '150');
            handRCircle.setAttribute('cy', '150');
          }
          eyes.forEach(eye => eye.setAttribute('r', '4.5'));
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
      headGroup.style.transform = `translate(0px, 0px)`;
      const armL = document.getElementById('armL');
      const armR = document.getElementById('armR');
      const handLCircle = document.getElementById('handL-circle');
      const handRCircle = document.getElementById('handR-circle');
      const eyes = document.querySelectorAll('#stickman .eye');
      if (armL) armL.setAttribute('d', 'M 100 110 C 80 110, 50 150, 50 150');
      if (armR) armR.setAttribute('d', 'M 100 110 C 120 110, 150 150, 150 150');
      if (handLCircle) {
        handLCircle.setAttribute('r', '0');
        handLCircle.setAttribute('cx', '50');
        handLCircle.setAttribute('cy', '150');
      }
      if (handRCircle) {
        handRCircle.setAttribute('r', '0');
        handRCircle.setAttribute('cx', '150');
        handRCircle.setAttribute('cy', '150');
      }
      eyes.forEach(eye => eye.setAttribute('r', '3.5'));
    });

    passwordInput.addEventListener('input', trackInputLength);

    updateStickman();

    return () => {
      passwordInput.removeEventListener('focus', updateStickman);
      passwordInput.removeEventListener('blur', () => {});
      passwordInput.removeEventListener('input', trackInputLength);
    };
  }, [isPasswordVisible, password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        logger.info('AUTH', 'Redirecting to home page', {}, 'Login', 'NAVIGATE');
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      logger.error('AUTH', 'Login error', err, 'Login', 'ERROR');
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="auth-page">
      <div className="container">
        <svg
          ref={stickmanRef}
          className="stickman-svg"
          viewBox="0 0 200 200"
          id="stickman"
        >
          <path className="draw" d="M 100 110 L 100 180" />
          <path className="draw" d="M 100 180 L 70 210" />
          <path className="draw" d="M 100 180 L 130 210" />
          <g id="head-group">
            <circle className="head-fill" cx="100" cy="70" r="32" />
            <circle className="eye" cx="88" cy="65" r="3.5" />
            <circle className="eye" cx="112" cy="65" r="3.5" />
            <path className="draw" d="M 90 85 Q 100 92 110 85" fill="none" style={{ strokeWidth: 3 }} />
          </g>
          <path className="draw" id="armL" d="M 100 110 C 80 110, 50 150, 50 150" />
          <circle className="hand-circle" id="handL-circle" cx="50" cy="150" />
          <path className="draw" id="armR" d="M 100 110 C 120 110, 150 150, 150 150" />
          <circle className="hand-circle" id="handR-circle" cx="150" cy="150" />
        </svg>

        <div className="login-box">
          <h2>Login</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <Label htmlFor="email">Login</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username"
                required
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <Label htmlFor="password">Password</Label>
              <div className="password-input-wrapper">
                <Input
                  ref={passwordInputRef}
                  id="password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  disabled={isLoading}
                  className="password-input"
                />
                <span
                  className="toggle-btn"
                  onClick={togglePasswordVisibility}
                >
                  {isPasswordVisible ? '❌' : '👁️'}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              No account?{' '}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                Register
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
            <p className="font-semibold mb-1">Test data:</p>
            <p>Email: testpanel@gmail.com</p>
            <p>Password: testpanel1$</p>
          </div>
        </div>
      </div>

      <style>{`
        .auth-page {
          font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif;
          background-color: #e0f7fa;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 100vh;
          padding: 20px;
          overflow-y: auto;
          box-sizing: border-box;
        }

        .auth-page::before,
        .auth-page::after {
          content: '';
          flex: 1 1 auto;
          min-height: 20px;
        }

        .container {
          position: relative;
          width: 100%;
          max-width: 320px;
          text-align: center;
          margin: auto;
          flex-shrink: 0;
        }

        .stickman-svg {
          width: 220px;
          height: 200px;
          margin: 0 auto -15px auto;
          display: block;
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

        .stickman-svg.peek .eye {
          r: 4.5;
          transition: r 0.2s;
        }

        .login-box {
          background: #fff;
          border: 4px solid #333;
          border-radius: 20px;
          padding: 35px 25px 25px;
          box-shadow: 10px 10px 0px rgba(0,0,0,0.15);
          position: relative;
          z-index: 10;
        }

        .login-box h2 {
          margin: 0 0 20px 0;
          color: #333;
        }

        .login-box form {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .input-group {
          margin-bottom: 15px;
          position: relative;
          text-align: left;
        }

        .input-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
        }

        .input-group input {
          width: 100%;
          padding: 12px;
          border: 3px solid #333;
          border-radius: 10px;
          box-sizing: border-box;
          font-family: inherit;
          font-size: 16px;
          outline: none;
          background: #f4f4f4;
          transition: background 0.2s;
        }

        .input-group input:focus {
          background: #fff;
          border-color: #000;
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-input {
          padding-right: 40px !important;
        }

        .toggle-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          font-size: 20px;
          user-select: none;
          opacity: 0.5;
          transition: opacity 0.2s;
          z-index: 10;
          pointer-events: auto;
        }
        .toggle-btn:hover {
          opacity: 1;
        }

        @media (max-height: 700px) {
          .auth-page {
            padding: 20px;
            align-items: flex-start;
          }
          .auth-page::before,
          .auth-page::after {
            min-height: 10px;
          }
          .stickman-svg {
            width: 180px;
            height: 160px;
          }
          .login-box {
            padding: 25px 20px 20px;
          }
        }

        @media (max-width: 400px) {
          .auth-page {
            padding: 15px;
          }
          .container {
            max-width: 100%;
          }
          .stickman-svg {
            width: 180px;
            height: 160px;
          }
        }

        @media (max-height: 600px) {
          .auth-page {
            padding: 10px;
          }
          .auth-page::before,
          .auth-page::after {
            min-height: 5px;
          }
          .stickman-svg {
            width: 160px;
            height: 140px;
          }
          .login-box {
            padding: 20px 15px 15px;
          }
        }
      `}</style>
    </div>
  );
}

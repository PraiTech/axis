import { useState, FormEvent, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import logger from '@/lib/logger';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const stickmanRef = useRef<SVGSVGElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const MAX_X_LOOK = 20;
  const MAX_Y_LEAN = 15;

  useEffect(() => {
    const stickman = stickmanRef.current;
    const passwordInput = passwordInputRef.current;
    const headGroup = document.getElementById('head-group-register');

    if (!stickman || !passwordInput || !headGroup) return;

    const updateStickman = () => {
      const isPasswordHidden = passwordInput.getAttribute('type') === 'password';
      const isFocused = document.activeElement === passwordInput;
      const armL = document.getElementById('armL-register');
      const armR = document.getElementById('armR-register');
      const handLCircle = document.getElementById('handL-circle-register');
      const handRCircle = document.getElementById('handR-circle-register');
      const eyes = document.querySelectorAll('#stickman-register .eye');

      stickman.classList.remove('blind');
      stickman.classList.remove('peek');

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
          trackInputLength();
        }
      }
    };

    const trackInputLength = () => {
      if (!stickman.classList.contains('peek')) return;

      const length = passwordInput.value.length;
      const cappedLength = Math.min(length, 25);
      const progress = cappedLength / 25;
      const moveX = (progress * (MAX_X_LOOK * 2)) - MAX_X_LOOK;
      const moveY = 5 + (progress * 5);
      const rotate = moveX * 0.5;

      headGroup.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotate}deg)`;
    };

    passwordInput.addEventListener('focus', updateStickman);
    passwordInput.addEventListener('blur', () => {
      stickman.classList.remove('blind');
      stickman.classList.remove('peek');
      headGroup.style.transform = `translate(0px, 0px)`;
      const armL = document.getElementById('armL-register');
      const armR = document.getElementById('armR-register');
      const handLCircle = document.getElementById('handL-circle-register');
      const handRCircle = document.getElementById('handR-circle-register');
      const eyes = document.querySelectorAll('#stickman-register .eye');
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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(email, password);
      if (success) {
        logger.info('AUTH', 'Redirecting to home page', {}, 'Register', 'NAVIGATE');
        navigate('/');
      } else {
        setError('An error occurred during registration');
      }
    } catch (err) {
      logger.error('AUTH', 'Registration error', err, 'Register', 'ERROR');
      setError('An error occurred during registration');
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
          id="stickman-register"
        >
          <path className="draw" d="M 100 110 L 100 180" />
          <path className="draw" d="M 100 180 L 70 210" />
          <path className="draw" d="M 100 180 L 130 210" />
          <g id="head-group-register">
            <circle className="head-fill" cx="100" cy="70" r="32" />
            <circle className="eye" cx="88" cy="65" r="3.5" />
            <circle className="eye" cx="112" cy="65" r="3.5" />
            <path className="draw" d="M 90 85 Q 100 92 110 85" fill="none" style={{ strokeWidth: 3 }} />
          </g>
          <path className="draw" id="armL-register" d="M 100 110 C 80 110, 50 150, 50 150" />
          <circle className="hand-circle" id="handL-circle-register" cx="50" cy="150" />
          <path className="draw" id="armR-register" d="M 100 110 C 120 110, 150 150, 150 150" />
          <circle className="hand-circle" id="handR-circle-register" cx="150" cy="150" />
        </svg>

        <div className="login-box">
          <h2>Registration</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
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
                  placeholder="Enter password"
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

            <div className="input-group">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                Sign In
              </Link>
            </p>
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

        .stickman-svg #head-group-register {
          transform-box: fill-box;
          transform-origin: center bottom;
          transition: transform 0.2s ease-out;
        }

        .stickman-svg.blind .hand-circle {
          r: 12;
        }

        .stickman-svg.blind #armL-register {
          d: path("M 100 110 C 80 110, 40 80, 88 65");
        }

        .stickman-svg.blind #armR-register {
          d: path("M 100 110 C 120 110, 160 80, 112 65");
        }

        .stickman-svg.blind #handL-circle-register {
          cx: 88;
          cy: 65;
        }

        .stickman-svg.blind #handR-circle-register {
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

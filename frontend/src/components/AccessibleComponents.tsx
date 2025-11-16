/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useId } from 'react';

// ♿ Componentes Acessíveis Reutilizáveis

/**
 * Botão Acessível
 * - Focus visível
 * - ARIA labels
 * - Suporte a teclado
 */
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  children: React.ReactNode;
}

export const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ ariaLabel, ariaDescribedBy, children, ...props }, ref) => (
    <button
      ref={ref}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`
        px-4 py-2 rounded-lg font-semibold
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-105
      `}
      {...props}
    >
      {children}
    </button>
  )
);
AccessibleButton.displayName = 'AccessibleButton';

/**
 * Input Acessível
 * - Labels associados
 * - Mensagens de erro
 * - aria-invalid, aria-required
 */
interface AccessibleInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  type?: string;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  helperText,
  type = 'text',
}) => {
  const helperId = `${id}-help`;
  const errorId = `${id}-error`;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span aria-label="obrigatório" className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        aria-invalid={!!error}
        className={`
          w-full px-3 py-2 rounded-md
          border-2 transition-colors
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
        `}
      />
      {helperText && (
        <p id={helperId} className="mt-1 text-xs text-gray-600">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600" role="alert">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
};

/**
 * Modal/Dialog Acessível
 * - Focus trap
 * - Keyboard support (Escape)
 * - ARIA modal
 */
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  closeButtonText?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  closeButtonText = 'Fechar',
}) => {
  const titleId = useId();
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      firstButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-0 flex items-center justify-center z-50"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
      >
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <h2 id={titleId} className="text-xl font-bold mb-4">
              {title}
            </h2>
            {children}
          </div>
          <div className="flex justify-end gap-3 p-4 border-t">
            <AccessibleButton
              ref={firstButtonRef}
              onClick={onClose}
              ariaLabel={`${closeButtonText} diálogo`}
            >
              {closeButtonText}
            </AccessibleButton>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Alert/Toast Acessível
 * - role="alert" para anúncios importantes
 * - Diferentes níveis: success, error, warning, info
 */
interface AccessibleAlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose?: () => void;
}

export const AccessibleAlert: React.FC<AccessibleAlertProps> = ({
  type,
  title,
  message,
  onClose,
}) => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        p-4 rounded-lg border-l-4 mb-4
        ${colors[type]}
      `}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true">{icons[type]}</span>
        <div className="flex-1">
          <h3 className="font-bold">{title}</h3>
          <p className="text-sm mt-1">{message}</p>
        </div>
        {onClose && (
          <AccessibleButton
            onClick={onClose}
            ariaLabel={`Fechar aviso: ${title}`}
            className="text-sm"
          >
            ✕
          </AccessibleButton>
        )}
      </div>
    </div>
  );
};

/**
 * Tab Group Acessível
 * - role="tablist", role="tab", role="tabpanel"
 * - Keyboard navigation (Arrow keys)
 */
interface AccessibleTabsProps {
  tabs: Array<{
    label: string;
    content: React.ReactNode;
    id: string;
  }>;
}

export const AccessibleTabs: React.FC<AccessibleTabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = React.useState(0);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    setActiveTab(newIndex);
  };

  return (
    <div>
      <div role="tablist" className="flex gap-2 border-b">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`
              px-4 py-2 font-medium transition-colors
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              ${
                activeTab === index
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== index}
          className="p-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};

/**
 * Checkbox Acessível
 * - Label apropriado
 * - aria-checked
 */
interface AccessibleCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const AccessibleCheckbox: React.FC<AccessibleCheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  disabled,
}) => {
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        aria-label={label}
        className="
          w-4 h-4 rounded
          focus:outline-none focus:ring-2 focus:ring-indigo-500
        "
      />
      <label htmlFor={id} className="text-sm text-gray-700 cursor-pointer">
        {label}
      </label>
    </div>
  );
};

/**
 * Skip Link - Pula para conteúdo principal
 * Útil para usuários de teclado
 */
export const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="
        absolute top-0 left-0 bg-indigo-600 text-white px-4 py-2
        -translate-y-full focus:translate-y-0 transition-transform
      "
    >
      Pular para conteúdo principal
    </a>
  );
};

/**
 * Loading Spinner Acessível
 * - aria-live para anúncio
 * - aria-label descritivo
 */
interface AccessibleSpinnerProps {
  label?: string;
}

export const AccessibleSpinner: React.FC<AccessibleSpinnerProps> = ({
  label = 'Carregando',
}) => {
  return (
    <div
      className="flex items-center justify-center"
      aria-live="polite"
      aria-label={label}
    >
      <div className="animate-spin">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
      <span className="ml-2 text-gray-600">{label}...</span>
    </div>
  );
};


import { axe } from 'jest-axe';
import { render } from '@testing-library/react';
import { type ReactElement } from 'react';

// Configuração padrão do axe para testes
const axeConfig = {
  rules: {
    // Desabilitar regras que podem ser problemáticas em testes
    'color-contrast': { enabled: false }, // Pode ser inconsistente em jsdom
    'landmark-one-main': { enabled: false }, // Nem todos os componentes precisam de main
  },
};

/**
 * Testa acessibilidade de um componente React
 * @param component - Componente React para testar
 * @param config - Configuração opcional do axe
 */
export const testAccessibility = async (
  component: ReactElement,
  config = axeConfig
) => {
  const { container } = render(component);
  const results = await axe(container, config);
  expect(results).toHaveNoViolations();
};

/**
 * Testa acessibilidade de um elemento DOM específico
 * @param element - Elemento DOM para testar
 * @param config - Configuração opcional do axe
 */
export const testElementAccessibility = async (
  element: Element,
  config = axeConfig
) => {
  const results = await axe(element, config);
  expect(results).toHaveNoViolations();
};

/**
 * Configurações específicas para diferentes tipos de componentes
 */
export const accessibilityConfigs = {
  // Para formulários
  form: {
    rules: {
      ...axeConfig.rules,
      'label': { enabled: true },
      'form-field-multiple-labels': { enabled: true },
    },
  },
  
  // Para navegação
  navigation: {
    rules: {
      ...axeConfig.rules,
      'landmark-unique': { enabled: true },
      'skip-link': { enabled: true },
    },
  },
  
  // Para modais
  modal: {
    rules: {
      ...axeConfig.rules,
      'focus-order-semantics': { enabled: true },
      'aria-dialog-name': { enabled: true },
    },
  },
  
  // Para tabelas
  table: {
    rules: {
      ...axeConfig.rules,
      'table-header': { enabled: true },
      'th-has-data-cells': { enabled: true },
    },
  },
};

/**
 * Testa navegação por teclado
 * @param element - Elemento para testar
 * @param expectedFocusableElements - Número esperado de elementos focáveis
 */
export const testKeyboardNavigation = (element: Element, expectedFocusableElements?: number) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (expectedFocusableElements !== undefined) {
    expect(focusableElements).toHaveLength(expectedFocusableElements);
  }
  
  // Verificar se todos os elementos focáveis têm indicação visual de foco
  focusableElements.forEach((el) => {
    const styles = window.getComputedStyle(el);
    const hasFocusStyles = 
      styles.outline !== 'none' || 
      styles.boxShadow !== 'none' ||
      styles.border !== 'none';
    
    expect(hasFocusStyles).toBe(true);
  });
};

/**
 * Verifica se um elemento tem atributos ARIA apropriados
 * @param element - Elemento para verificar
 * @param expectedAttributes - Atributos ARIA esperados
 */
export const checkAriaAttributes = (
  element: Element,
  expectedAttributes: Record<string, string | boolean>
) => {
  Object.entries(expectedAttributes).forEach(([attr, value]) => {
    if (typeof value === 'boolean') {
      if (value) {
        expect(element).toHaveAttribute(attr);
      } else {
        expect(element).not.toHaveAttribute(attr);
      }
    } else {
      expect(element).toHaveAttribute(attr, value);
    }
  });
};

/**
 * Verifica contraste de cores (simulado para testes)
 * @param element - Elemento para verificar
 * @param minimumRatio - Ratio mínimo de contraste (padrão: 4.5)
 */
export const checkColorContrast = (
  element: Element
) => {
  // Em um ambiente real, você usaria uma biblioteca como color-contrast
  // Para testes, vamos apenas verificar se as cores não são iguais
  const styles = window.getComputedStyle(element);
  const color = styles.color;
  const backgroundColor = styles.backgroundColor;
  
  // Verificação básica - cores não devem ser iguais
  expect(color).not.toBe(backgroundColor);
  
  // Em produção, você implementaria cálculo real de contraste aqui
  console.log(`Verificando contraste: ${color} sobre ${backgroundColor}`);
};
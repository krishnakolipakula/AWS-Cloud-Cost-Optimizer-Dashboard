// React Components
export { default as Button } from './react/Button';

// Shared styles
export * from './styles';

// Usage examples and documentation
export const examples = {
  react: {
    basic: `<Button onClick={() => console.log('clicked')}>Click me</Button>`,
    variants: `
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
    `,
    sizes: `
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    `
  },
  angular: {
    basic: `<ui-button (onClick)="handleClick()">Click me</ui-button>`,
    variants: `
      <ui-button variant="primary">Primary</ui-button>
      <ui-button variant="secondary">Secondary</ui-button>
      <ui-button variant="danger">Danger</ui-button>
    `,
    sizes: `
      <ui-button size="small">Small</ui-button>
      <ui-button size="medium">Medium</ui-button>
      <ui-button size="large">Large</ui-button>
    `
  }
};
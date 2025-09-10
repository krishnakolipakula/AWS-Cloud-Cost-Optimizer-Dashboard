import { Component, Input, Output, EventEmitter } from '@angular/core';
import './button.css';

@Component({
  selector: 'ui-button',
  template: `
    <button 
      [type]="type"
      [class]="buttonClass"
      [disabled]="disabled"
      (click)="onClick.emit()">
      <ng-content></ng-content>
    </button>
  `,
  styleUrls: ['./button.css']
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() onClick = new EventEmitter<void>();

  get buttonClass(): string {
    return `ui-button ui-button--${this.variant} ui-button--${this.size}`;
  }
}
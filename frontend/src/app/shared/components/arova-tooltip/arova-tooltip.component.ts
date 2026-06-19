import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'arova-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="arova-tooltip-box tooltip-{{ position }}" [class.visible]="visible">
      <div class="tooltip-content">
        <ng-content></ng-content>
        <span *ngIf="text">{{ text }}</span>
      </div>
      <div class="tooltip-arrow"></div>
    </div>
  `,
  styles: [`
    .arova-tooltip-box {
      position: absolute;
      background: rgba(18, 16, 20, 0.95);
      border: 1px solid var(--theme-border, rgba(255, 255, 255, 0.15));
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: var(--theme-text, #fffbfa);
      padding: 8px 12px;
      border-radius: var(--arova-radius-sm, 8px);
      font-size: 0.78rem;
      font-weight: 500;
      white-space: normal;
      word-break: break-word;
      max-width: 240px;
      z-index: 10000;
      opacity: 0;
      pointer-events: none;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .arova-tooltip-box.visible {
      opacity: 1;
    }
    
    .tooltip-arrow {
      position: absolute;
      width: 0;
      height: 0;
      border-style: solid;
    }
    
    /* Top placement */
    .tooltip-top {
      transform: translate(-50%, 6px);
    }
    .tooltip-top.visible {
      transform: translate(-50%, 0);
    }
    .tooltip-top .tooltip-arrow {
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 6px 6px 0 6px;
      border-color: rgba(18, 16, 20, 0.95) transparent transparent transparent;
    }
    
    /* Bottom placement */
    .tooltip-bottom {
      transform: translate(-50%, -6px);
    }
    .tooltip-bottom.visible {
      transform: translate(-50%, 0);
    }
    .tooltip-bottom .tooltip-arrow {
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 0 6px 6px 6px;
      border-color: transparent transparent rgba(18, 16, 20, 0.95) transparent;
    }
    
    /* Right placement */
    .tooltip-right {
      transform: translate(-6px, -50%);
    }
    .tooltip-right.visible {
      transform: translate(0, -50%);
    }
    .tooltip-right .tooltip-arrow {
      left: -6px;
      top: 50%;
      transform: translateY(-50%);
      border-width: 6px 6px 6px 0;
      border-color: transparent rgba(18, 16, 20, 0.95) transparent transparent;
    }
    
    /* Left placement */
    .tooltip-left {
      transform: translate(6px, -50%);
    }
    .tooltip-left.visible {
      transform: translate(0, -50%);
    }
    .tooltip-left .tooltip-arrow {
      right: -6px;
      top: 50%;
      transform: translateY(-50%);
      border-width: 6px 0 6px 6px;
      border-color: transparent transparent transparent rgba(18, 16, 20, 0.95);
    }
  `]
})
export class ArovaTooltipComponent {
  @Input() text = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() visible = false;
}

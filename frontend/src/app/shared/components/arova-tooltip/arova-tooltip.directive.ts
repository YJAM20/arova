import { Directive, Input, ElementRef, Renderer2, HostListener, ViewContainerRef, ComponentRef, inject } from '@angular/core';
import { ArovaTooltipComponent } from './arova-tooltip.component';

@Directive({
  selector: '[arovaTooltip]',
  standalone: true
})
export class ArovaTooltipDirective {
  @Input('arovaTooltip') text = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

  private componentRef: ComponentRef<ArovaTooltipComponent> | null = null;
  private elementRef = inject(ElementRef);
  private viewContainerRef = inject(ViewContainerRef);
  private renderer = inject(Renderer2);

  @HostListener('mouseenter')
  @HostListener('focusin')
  onMouseEnter(): void {
    if (!this.componentRef && this.text) {
      this.createTooltip();
    }
  }

  @HostListener('mouseleave')
  @HostListener('focusout')
  onMouseLeave(): void {
    if (this.componentRef) {
      this.destroyTooltip();
    }
  }

  private createTooltip(): void {
    this.componentRef = this.viewContainerRef.createComponent(ArovaTooltipComponent);
    const instance = this.componentRef.instance;
    instance.text = this.text;
    instance.position = this.tooltipPosition;

    const tooltipElement = this.componentRef.location.nativeElement;
    this.renderer.appendChild(document.body, tooltipElement);

    this.setPosition();

    setTimeout(() => {
      if (this.componentRef) {
        this.componentRef.instance.visible = true;
      }
    });
  }

  private setPosition(): void {
    if (!this.componentRef) return;

    const hostPos = this.elementRef.nativeElement.getBoundingClientRect();
    
    // Set position temporarily to calculate size
    const tooltipBox = this.componentRef.location.nativeElement.querySelector('.arova-tooltip-box');
    this.renderer.setStyle(tooltipBox, 'opacity', '0');
    this.renderer.setStyle(tooltipBox, 'display', 'block');
    
    const tooltipPos = tooltipBox.getBoundingClientRect();

    const scrollPos = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft || document.body.scrollLeft || 0;

    let top = 0;
    let left = 0;

    if (this.tooltipPosition === 'top') {
      top = hostPos.top - tooltipPos.height - 10 + scrollPos;
      left = hostPos.left + hostPos.width / 2 + scrollLeft;
    } else if (this.tooltipPosition === 'bottom') {
      top = hostPos.bottom + 10 + scrollPos;
      left = hostPos.left + hostPos.width / 2 + scrollLeft;
    } else if (this.tooltipPosition === 'left') {
      top = hostPos.top + hostPos.height / 2 - tooltipPos.height / 2 + scrollPos;
      left = hostPos.left - tooltipPos.width - 10 + scrollLeft;
    } else if (this.tooltipPosition === 'right') {
      top = hostPos.top + hostPos.height / 2 - tooltipPos.height / 2 + scrollPos;
      left = hostPos.right + 10 + scrollLeft;
    }

    if (tooltipBox) {
      this.renderer.setStyle(tooltipBox, 'top', `${top}px`);
      this.renderer.setStyle(tooltipBox, 'left', `${left}px`);
      this.renderer.removeStyle(tooltipBox, 'display');
    }
  }

  private destroyTooltip(): void {
    if (this.componentRef) {
      this.componentRef.instance.visible = false;
      const ref = this.componentRef;
      this.componentRef = null;
      
      setTimeout(() => {
        ref.destroy();
      }, 200);
    }
  }
}

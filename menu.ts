import { Component, effect, signal } from '@angular/core';
import { MenuItem } from '../menu/menu.interface';
import { MenuService } from '../services/menu';
import { Router, RouterLink } from '@angular/router';
import { SelectedItemService } from '../services/selected-item';
@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  menuItems = signal<MenuItem[]>([]);
  selectedCake: MenuItem | null = null;

  constructor(
    private menuService: MenuService,
    private selectedService: SelectedItemService,
    private router: Router
  ) {
    effect(() => {
      this.menuService.getMenuItems().subscribe((items) => {
        this.menuItems.set(items);
      });
    });
  }
  viewCakeDetails(item: MenuItem) {
    this.selectedService.setItem(item);
    this.router.navigate(['/cakes']);
  }
  buyNow() {
    if (this.selectedCake) {
      this.selectedService.setItem(this.selectedCake);
      this.router.navigate(['/cart']);
    }
  }
}

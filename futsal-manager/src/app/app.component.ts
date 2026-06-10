import { Component, OnInit, OnDestroy, Inject, NgZone } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Veteranos';
  showScrollTop = false;

  constructor(
    @Inject(DOCUMENT) private doc: Document,
    private ngZone: NgZone
  ) {}

  private scrollListener = () => {
    const top = this.doc.body.scrollTop;
    this.ngZone.run(() => {
      this.showScrollTop = top > 100;
    });
  };

  ngOnInit() {
    this.doc.body.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  ngOnDestroy() {
    this.doc.body.removeEventListener('scroll', this.scrollListener);
  }

  scrollToTop() {
    this.doc.body.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export class NavigationControl {
    public static selectActiveNavigationItem (activeElementNavigation: HTMLElement, activeCategoryNavigation?: HTMLElement): void {
        const elementsNavigation: NodeListOf<Element> = document.querySelectorAll('.nav-element_active');

        Array.from(elementsNavigation).forEach(item => {
            item.classList.remove('activated');
        });
        if (activeCategoryNavigation) {
            activeCategoryNavigation.classList.add('activated');
        }
        activeElementNavigation.classList.add('activated');
    }
}
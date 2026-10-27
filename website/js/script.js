// Scripts voor CurrywurstCrew

// ---------- Tabs: wisselen tussen Shiso Burger en AMRIT (Mahmoud) ----------
// Zet data-restaurant op <body>. De CSS verbergt dan het andere restaurant
// en verandert de accentkleur (--accent).
// Andere onderdelen (slideshow, kaart) kunnen luisteren naar het event 'restaurantchange'.

var tabs = document.querySelectorAll('[role="tab"]');

function kiesRestaurant(restaurant) {
    document.body.dataset.restaurant = restaurant;

    tabs.forEach(function (tab) {
        var actief = tab.dataset.tab === restaurant;
        tab.setAttribute('aria-selected', actief);
        tab.tabIndex = actief ? 0 : -1;
    });

    document.dispatchEvent(new CustomEvent('restaurantchange', {
        detail: { restaurant: restaurant }
    }));
}

tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
        kiesRestaurant(tab.dataset.tab);
    });

    // Met de pijltjestoetsen naar de andere tab
    tab.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        var stap = e.key === 'ArrowRight' ? 1 : -1;
        var volgende = tabs[(index + stap + tabs.length) % tabs.length];
        volgende.focus();
        kiesRestaurant(volgende.dataset.tab);
    });
});

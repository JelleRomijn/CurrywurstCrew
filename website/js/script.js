// Scripts voor CurrywurstCrew

// ---------- Hamburgermenu op mobiel ----------
// De knop zet de class 'is-open' op de header. De CSS laat dan het menu zien.

var header = document.querySelector('.site-header');
var menuKnop = header.querySelector('.menu-knop');

function zetMenu(open) {
    header.classList.toggle('is-open', open);
    menuKnop.setAttribute('aria-expanded', open);
    menuKnop.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
}

menuKnop.addEventListener('click', function () {
    zetMenu(!header.classList.contains('is-open'));
});

// Menu dicht na het kiezen van een link
header.querySelectorAll('.site-nav a').forEach(function (link) {
    link.addEventListener('click', function () {
        zetMenu(false);
    });
});

// Menu dicht met Escape, en de focus terug op de knop
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('is-open')) {
        zetMenu(false);
        menuKnop.focus();
    }
});


// ---------- Tabs: wisselen tussen Shiso Burger en AMRIT (Mahmoud) ----------
// Zet data-restaurant op <body>. De CSS verbergt dan het andere restaurant
// en verandert de accentkleur (--accent).
// Andere onderdelen (slideshow, kaart) kunnen luisteren naar het event 'restaurantchange'.

var tabs = document.querySelectorAll('[data-tab]');

function kiesRestaurant(restaurant) {
    document.body.dataset.restaurant = restaurant;

    // aria-pressed vertelt schermlezers welke knop aan staat
    tabs.forEach(function (tab) {
        tab.setAttribute('aria-pressed', tab.dataset.tab === restaurant);
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


// ---------- Slideshow (zelf geprogrammeerd) ----------
// Elk restaurant heeft een eigen slideshow: <div class="slideshow" data-slideshow>.
// Alle foto's liggen over elkaar, alleen de foto met de class 'is-actief' is te zien.
// Het bijschrift onder de foto staat in data-bijschrift op de <img>.

document.querySelectorAll('[data-slideshow]').forEach(function (slideshow) {
    var fotos = slideshow.querySelectorAll('.slide__foto');
    var thumbs = slideshow.querySelectorAll('.slideshow__thumb');
    var teller = slideshow.querySelector('.slideshow__teller');
    var bijschrift = slideshow.querySelector('.slideshow__bijschrift');
    var venster = slideshow.querySelector('.slideshow__venster');
    var huidige = 0;

    function toonFoto(nummer) {
        // Na de laatste foto weer naar de eerste, en andersom
        huidige = (nummer + fotos.length) % fotos.length;

        fotos.forEach(function (foto, index) {
            foto.classList.toggle('is-actief', index === huidige);
        });

        thumbs.forEach(function (thumb, index) {
            if (index === huidige) {
                thumb.setAttribute('aria-current', 'true');
            } else {
                thumb.removeAttribute('aria-current');
            }
        });

        teller.textContent = (huidige + 1) + ' / ' + fotos.length;
        bijschrift.textContent = fotos[huidige].dataset.bijschrift;
    }

    slideshow.querySelector('.slideshow__knop--vorige').addEventListener('click', function () {
        toonFoto(huidige - 1);
    });

    slideshow.querySelector('.slideshow__knop--volgende').addEventListener('click', function () {
        toonFoto(huidige + 1);
    });

    thumbs.forEach(function (thumb, index) {
        thumb.addEventListener('click', function () {
            toonFoto(index);
        });
    });

    // Met de pijltjestoetsen door de foto's als je in de slideshow staat
    slideshow.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') toonFoto(huidige - 1);
        if (e.key === 'ArrowRight') toonFoto(huidige + 1);
    });

    // Op een telefoon naar links of rechts vegen
    var startX = null;

    venster.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
    }, { passive: true });

    venster.addEventListener('touchend', function (e) {
        if (startX === null) return;
        var verschil = e.changedTouches[0].clientX - startX;
        if (Math.abs(verschil) > 40) {
            toonFoto(verschil < 0 ? huidige + 1 : huidige - 1);
        }
        startX = null;
    });

    toonFoto(0);
});


// ---------- Kaart volgt de gekozen tab ----------
// De kaart (js/kaart.js van Jasper) laat de route van het gekozen restaurant het sterkst zien.

if (window.Kaart) {
    window.Kaart.toon(document.body.dataset.restaurant, false);

    document.addEventListener('restaurantchange', function (e) {
        window.Kaart.toon(e.detail.restaurant);
    });
}
 

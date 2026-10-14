/* Kaart-sectie: tekent het hotel, de restaurants en de looproutes met Leaflet.
   Andere onderdelen van de site kunnen één restaurant uitlichten met Kaart.toon('shiso')
   of Kaart.toon('amrit'), en alles weer tonen met Kaart.toon(null). */

(function () {
    var data = window.KAART_DATA;
    var sectie = document.querySelector('[data-kaart]');
    if (!sectie || !data) return;

    var kader = sectie.querySelector('.kaart__kader');
    var legenda = sectie.querySelector('.kaart__legenda');
    var hotel = data.hotel;
    var restaurants = data.restaurants;

    if (!window.L) {
        toonFout();
        return;
    }

    var map = L.map(sectie.querySelector('.kaart__map'), {
        zoomControl: false,
        zoomSnap: 0.25,
        minZoom: 14,
        maxBounds: [[52.500, 13.350], [52.545, 13.435]],
        maxBoundsViscosity: 1,
        inertiaMaxSpeed: 600,
        scrollWheelZoom: false,
        attributionControl: false
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
    }).addTo(map);

    L.control.attribution({ position: 'bottomleft', prefix: false })
        .addAttribution('© <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap-bijdragers</a>')
        .addTo(map);

    L.marker(hotel.positie, {
        icon: maakPin('H', 'hotel'),
        title: hotel.naam,
        zIndexOffset: 1000
    })
        .bindPopup(popupTekst(hotel))
        .addTo(map);

    var lagen = {};
    Object.keys(restaurants).forEach(function (key) {
        var r = restaurants[key];
        lagen[key] = {
            lijnen: tekenRoute(r),
            marker: L.marker(r.positie, { icon: maakPin('R', 'restaurant', r.kleur), title: r.naam })
                .bindPopup(popupTekst(r))
                .addTo(map),
            knop: maakLegendaKnop(key, r)
        };
    });

    sectie.querySelector('[data-kaart-zoom="in"]').addEventListener('click', function () { map.zoomIn(); });
    sectie.querySelector('[data-kaart-zoom="uit"]').addEventListener('click', function () { map.zoomOut(); });

    var actief = null;
    toon(null, false);

    window.Kaart = { toon: toon };

    function toon(key, animeer) {
        actief = restaurants[key] ? key : null;
        sectie.classList.toggle('kaart--gefocust', actief !== null);

        var punten = [hotel.positie];
        Object.keys(lagen).forEach(function (k) {
            var zichtbaar = !actief || k === actief;
            lagen[k].lijnen.forEach(function (lijn) {
                lijn.setStyle({ opacity: zichtbaar ? lijn.options.basisOpacity : 0.15 });
            });
            lagen[k].marker.setOpacity(zichtbaar ? 1 : 0.35);
            lagen[k].knop.setAttribute('aria-pressed', String(k === actief));
            if (zichtbaar) punten = punten.concat(restaurants[k].route);
        });

        var rand = Math.min(64, kader.clientWidth / 10);
        map.fitBounds(L.latLngBounds(punten), { padding: [rand, rand], maxZoom: 17, animate: animeer !== false });
    }

    function tekenRoute(r) {
        var onder = L.polyline(r.route, {
            color: r.kleur,
            weight: 10,
            opacity: 0.9,
            basisOpacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
            interactive: false
        }).addTo(map);

        var streep = L.polyline(r.route, {
            color: '#17141A',
            weight: 3,
            opacity: 1,
            basisOpacity: 1,
            dashArray: '8 8',
            interactive: false
        }).addTo(map);

        return [onder, streep];
    }

    function maakPin(letter, soort, kleur) {
        var stijl = kleur ? ' style="--accent: ' + kleur + '"' : '';
        return L.divIcon({
            className: 'kaart-icoon',
            html: '<span class="kaart-pin kaart-pin--' + soort + '"' + stijl + '>' + letter + '</span>',
            iconSize: [34, 34],
            iconAnchor: [17, 17],
            popupAnchor: [0, -18]
        });
    }

    function maakLegendaKnop(key, r) {
        var item = document.createElement('li');
        item.className = 'kaart__legenda-item';

        var knop = document.createElement('button');
        knop.type = 'button';
        knop.className = 'kaart__legenda-item kaart__legenda-knop';
        knop.setAttribute('aria-pressed', 'false');
        knop.setAttribute('aria-label', 'Toon de route naar ' + r.naam);
        knop.innerHTML = '<span class="kaart__teken kaart__teken--restaurant" style="--accent: ' + r.kleur + '" aria-hidden="true">R</span>' +
            '<span class="kaart__legenda-naam">' + r.naam + '</span>';
        knop.addEventListener('click', function () {
            toon(actief === key ? null : key);
        });

        item.appendChild(knop);
        legenda.appendChild(item);
        return knop;
    }

    function popupTekst(plek) {
        return '<strong>' + plek.naam + '</strong>' + plek.adres;
    }

    function toonFout() {
        var melding = document.createElement('p');
        melding.className = 'kaart__fout';
        melding.textContent = 'De kaart kon niet laden. Het hotel ligt aan de ' + hotel.adres + '; ' +
            Object.keys(restaurants).map(function (k) {
                return restaurants[k].naam + ' aan de ' + restaurants[k].adres;
            }).join(' en ') + '.';
        kader.replaceChildren(melding);
    }
})();

(function() {
    // ── GA4/GTM click tracking ──────────────────────────────────────────
    // Any element with data-ga-event="some_name" fires a 'cta_click' event
    // to the GTM dataLayer when clicked. Configure GA4 events in GTM based
    // on this dataLayer event without needing further code changes.
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-ga-event]');
      if (!el) return;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'cta_click',
        cta_name: el.getAttribute('data-ga-event')
      });
    });

//===== Prealoder

	window.onload = function () {
		window.setTimeout(fadeout, 500);
	}

    function fadeout() {
        var preloader = document.querySelector('.preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            preloader.style.display = 'none';
        }
    }


    /*=====================================
    Sticky
    ======================================= */
    window.onscroll = function () {
        var header_navbar = document.querySelector(".navbar-area");
        var sticky = header_navbar.offsetTop;

        if (window.pageYOffset > sticky) {
            header_navbar.classList.add("sticky");
        } else {
            header_navbar.classList.remove("sticky");
        }



        // show or hide the back-top-top button
        var backToTo = document.querySelector(".scroll-top");
        if (backToTo) {
            if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
                backToTo.style.display = "flex";
            } else {
                backToTo.style.display = "none";
            }
        }
    };

    // Get the navbar


    // for menu scroll 
    var pageLink = document.querySelectorAll('.page-scroll');
    
    pageLink.forEach(elem => {
        elem.addEventListener('click', e => {
            e.preventDefault();
            document.querySelector(elem.getAttribute('href')).scrollIntoView({
                behavior: 'smooth',
                offsetTop: 1 - 60,
            });
        });
    });


    //===== close navbar-collapse when a  clicked
    let navbarToggler = document.querySelector(".navbar-toggler");    
    var navbarCollapse = document.querySelector(".navbar-collapse");

    document.querySelectorAll(".page-scroll").forEach(e =>
        e.addEventListener("click", () => {
            navbarToggler.classList.remove("active");
            navbarCollapse.classList.remove('show')
        })
    );
    navbarToggler.addEventListener('click', function() {
        navbarToggler.classList.toggle("active");
    }) 


	// WOW active (só executa se WOW estiver definido)
    if (typeof WOW !== 'undefined') {
        new WOW().init();
    }
    
    //====== counter up 
    var cu = new counterUp({
        start: 0,
        duration: 2000,
        intvalues: true,
        interval: 100,
        append: " ",
    });
    cu.start();

    //======== tiny slider
    // Removido o slider testimonial-active pois não existe esse container no HTML

    // ── WhatsApp floating button ──────────────────────────────────────────
    var SUPABASE_URL = 'https://tdttqltbnizljmsajqlc.supabase.co';
    var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdHRxbHRibml6bGptc2FqcWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMDc0NzAsImV4cCI6MjA1NTU4MzQ3MH0.v__13i-EzViT2Eaz4gd2CFJlTq_W5kbDdIQtXSpXnfU';
    var WA_NUMBER = '5551996301302';

    function injectWhatsAppButton(msgText) {
      var href = 'https://wa.me/' + WA_NUMBER;
      if (msgText) href += '?text=' + encodeURIComponent(msgText);
      var a = document.createElement('a');
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'whatsapp-float';
      a.setAttribute('aria-label', 'Falar no WhatsApp');
      a.setAttribute('data-ga-event', 'whatsapp_float');
      a.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.943 0C5.352 0 0 5.353 0 11.943c0 2.105.553 4.122 1.6 5.898L.058 23.899l6.187-1.62A11.896 11.896 0 0011.943 24c6.591 0 11.943-5.353 11.943-11.943C23.886 5.353 18.534 0 11.943 0zm0 21.818a9.866 9.866 0 01-5.022-1.373l-.36-.214-3.729.977.995-3.638-.235-.374a9.87 9.87 0 01-1.511-5.253c0-5.445 4.428-9.874 9.862-9.874 5.445 0 9.874 4.429 9.874 9.874 0 5.445-4.429 9.875-9.874 9.875z"/></svg>';
      document.body.appendChild(a);
    }

    fetch(SUPABASE_URL + '/rest/v1/site_config?key=eq.whatsapp_message&select=value', {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      }
    })
    .then(function(r) { return r.json(); })
    .then(function(rows) {
      var msg = rows && rows[0] ? rows[0].value : '';
      injectWhatsAppButton(msg);
    })
    .catch(function() { injectWhatsAppButton(''); });

})();
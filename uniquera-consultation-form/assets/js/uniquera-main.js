function getUtmParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const td = (typeof uniqueraForm !== 'undefined' && uniqueraForm.trackingDefaults) ? uniqueraForm.trackingDefaults : {};
    const utmMedium = (urlParams.get('utm_medium') || 'organic').toLowerCase();

    let sourceValue;
    if (utmMedium === 'cpc' || utmMedium === 'paid') {
        sourceValue = 'Paid ads';
    } else if (utmMedium === 'test') {
        sourceValue = 'test';
    } else {
        sourceValue = 'Organic';
    }

    return {
        utm_source: urlParams.get('utm_source') || td.utm_source || '',
        utm_medium: utmMedium,
        utm_campaign: urlParams.get('utm_campaign') || td.utm_campaign || 'uniquera_consultation_form',
        utm_audience: urlParams.get('utm_audience') || (td.utm_audience != null ? td.utm_audience : ''),
        source: sourceValue,
        page_url: window.location.href
    };
}

function uniqueraThankYouParamPresent() {
    try {
        var u = new URL(window.location.href);
        return u.searchParams.get('thankyou') === '1' || u.searchParams.get('thank-you') === '1';
    } catch (e) {
        return false;
    }
}

/**
 * Signals successful consultation form submission for Google Tag Manager / GA.
 * Uses window.dataLayer (GTM-compatible) plus gtag(...) when loaded from index.html.
 */
function uniqueraSignalConsultationFormSubmit(payload) {
    var ut = {};
    try {
        ut = getUtmParameters();
    } catch (_eUt) {}

    var base = typeof payload === 'object' && payload !== null ? payload : {};
    var eventName = typeof base.event !== 'undefined' && base.event !== null && base.event !== ''
        ? base.event
        : 'uniquera_consultation_form_submit_success';
    try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(Object.assign({}, {
            event: eventName,
            form_id: 'uniquera_consultation_form',
            form_name: 'Uniquera consultation form',
            form_flow_version: 5,
            page_path: (typeof window !== 'undefined' && window.location.pathname) ? window.location.pathname : '',
            page_hostname: (typeof window !== 'undefined' && window.location.hostname) ? window.location.hostname : '',
            page_url: ut.page_url || (typeof window !== 'undefined' ? window.location.href : ''),
            utm_source: ut.utm_source || '',
            utm_medium: ut.utm_medium || '',
            utm_campaign: ut.utm_campaign || '',
            utm_audience: ut.utm_audience || ''
        }, base));
    } catch (_eDl) {}

    try {
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'consultation_form_submit_success', {
                form_id: 'uniquera_consultation_form',
                funnel_step: typeof base.funnel_step === 'string' ? base.funnel_step : '',
                utm_medium: ut.utm_medium || undefined,
                utm_campaign: ut.utm_campaign || undefined,
                utm_source: ut.utm_source || undefined
            });
        }
    } catch (_eGtag) {}
}

var UNIQUERA_CONSULTATION_WEBHOOK_URL =
    'https://script.google.com/macros/s/AKfycbxVlmfXYmOUzLGGQnfmXaGwVtES0wl9D_9PDlf9wfk-ouNBUNIBUyqmodXVamqt5fsQ/exec';

/**
 * Background POST to Google Apps Script after successful consultation submit.
 * Fire-and-forget; never throws or affects the main submit / thank-you flow.
 */
function uniqueraPostConsultationWebhookSilent(name, email) {
    var trimmedName = typeof name === 'string' ? name.trim() : String(name || '').trim();
    var trimmedEmail = typeof email === 'string' ? email.trim() : String(email || '').trim();
    if (!trimmedName && !trimmedEmail) {
        return;
    }

    (async function () {
        try {
            var response = await fetch(UNIQUERA_CONSULTATION_WEBHOOK_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name: trimmedName, email: trimmedEmail})
            });
            if (!response.ok) {
                throw new Error('webhook request failed');
            }
        } catch (_webhookErr) {
            /* silent — main form flow must not be affected */
        }
    })();
}

/** Read name/email from the consultation form root and post webhook silently. */
function uniqueraPostConsultationWebhookFromRoot($root) {
    if (!$root || !$root.length) {
        return;
    }
    uniqueraPostConsultationWebhookSilent(
        $root.find('input[name=fullName]').val(),
        $root.find('input[name=email]').val()
    );
}

/** Normalize jQuery AJAX payloads some hosts return as plain text or with a BOM. */
function uniqueraCoerceAjaxJson(respRaw) {
    if (respRaw === null || typeof respRaw === 'undefined') {
        return null;
    }
    if (typeof respRaw === 'object') {
        return respRaw;
    }
    if (typeof respRaw === 'string') {
        var s = respRaw.replace(/^\uFEFF/, '').trim();
        try {
            return window.JSON.parse(s);
        } catch (_e) {
            return null;
        }
    }
    return null;
}

/** e.g. /subdir/api/foo.php → /subdir/thank-you/ ; /api/foo.php → /thank-you/ */
function uniqueraDefaultThankYouPathFromAjax(ajaxUrl) {
    if (!ajaxUrl || typeof ajaxUrl !== 'string') {
        return '/thank-you/';
    }
    try {
        var u = ajaxUrl.replace(/\\/g, '/');
        var marker = '/api/';
        var idx = u.indexOf(marker);
        if (idx <= 0) {
            return '/thank-you/';
        }
        var prefix = u.slice(0, idx);
        if (!prefix) {
            return '/thank-you/';
        }
        return prefix.replace(/\/+$/, '') + '/thank-you/';
    } catch (_e) {
        return '/thank-you/';
    }
}

function uniqueraResolveThankYouRedirectUrl() {
    var fromCfg = '';
    if (typeof uniqueraForm !== 'undefined' && uniqueraForm && typeof uniqueraForm.thankYouUrl === 'string') {
        fromCfg = uniqueraForm.thankYouUrl.trim();
    }
    if (fromCfg) {
        return fromCfg;
    }

    var dom = '';
    try {
        var el = document.getElementById('uniquera-react-form-root');
        if (el && el.getAttribute) {
            dom = (el.getAttribute('data-thank-you-url') || '').trim();
        }
    } catch (_eDom) {}

    if (dom) {
        return dom;
    }

    var pathGuess = uniqueraDefaultThankYouPathFromAjax(
        (typeof uniqueraForm !== 'undefined' && uniqueraForm && uniqueraForm.ajaxUrl) ? uniqueraForm.ajaxUrl : ''
    );
    pathGuess = pathGuess.charAt(0) === '/' ? pathGuess : '/' + pathGuess;

    try {
        var origin = typeof window.location !== 'undefined' && window.location.origin ? window.location.origin : '';
        if (origin) {
            return origin + pathGuess;
        }
    } catch (_eO) {}

    return pathGuess;
}

function uniqueraSetThankYouUrl() {
    try {
        var u = new URL(window.location.href);
        if (u.searchParams.get('thankyou') === '1') {
            return;
        }
        u.searchParams.set('thankyou', '1');
        u.searchParams.delete('thank-you');
        var tail = window.location.hash || '';
        history.replaceState({ uniqueraThankYou: true }, '', u.pathname + u.search + tail);
    } catch (e) {
        /* ignore */
    }
}

function uniqueraSafeStorageJSON(key, fallbackValue) {
    try {
        var raw = localStorage.getItem(key);
        if (!raw) {
            return fallbackValue;
        }
        var parsed = JSON.parse(raw);
        return parsed == null ? fallbackValue : parsed;
    } catch (e) {
        try {
            localStorage.removeItem(key);
        } catch (_ignore) {
            /* ignore */
        }
        return fallbackValue;
    }
}

/**
 * Async submit to WordPress (uploads + DB + email on server). Returns jQuery jqXHR.
 * @param {FormData} formData
 * @returns {JQuery.jqXHR|JQuery.Promise}
 */
function uniqueraSubmitToWordPressAsync(formData) {
    if (typeof uniqueraForm === 'undefined' || !uniqueraForm.ajaxUrl) {
        return jQuery.Deferred().reject({ status: 0, statusText: 'no_config' }).promise();
    }
    formData.append('action', 'uniquera_form_submit');
    formData.append('nonce', uniqueraForm.nonce);
    return jQuery.ajax({
        url: uniqueraForm.ajaxUrl,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        timeout: 0
    });
}

/**
 * Fetch a fresh nonce from WordPress for cached pages.
 * @returns {JQuery.jqXHR|JQuery.Promise}
 */
function uniqueraFetchFreshNonceAsync() {
    if (typeof uniqueraForm === 'undefined' || !uniqueraForm.ajaxUrl) {
        return jQuery.Deferred().reject({ status: 0, statusText: 'no_config' }).promise();
    }
    return jQuery.ajax({
        url: uniqueraForm.ajaxUrl,
        type: 'POST',
        data: { action: 'uniquera_form_nonce' }
    });
}

/**
 * Full-screen overlay while submission is in progress (non-blocking AJAX).
 * @param {JQuery} $root
 * @returns {JQuery}
 */
function uniqueraShowSubmitLoader($root) {
    var id = 'uniquera-submit-loader-' + String(Date.now());
    var html = '<div id="' + id + '" class="uniquera-submit-loader" role="status" aria-live="polite" aria-busy="true">' +
        '<div class="uniquera-submit-loader__inner">' +
        '<div class="uniquera-submit-loader__spinner" aria-hidden="true"></div>' +
        '<p class="uniquera-submit-loader__text">Submitting…</p>' +
        '</div></div>';
    $root.append(html);
    return $root.find('#' + id);
}

(function ($) {
    "use strict";

    $.fn.onlineForm = function (options) {

        var settings = $.extend({
            waitType: '50',
            waitClick: '500',
            waitLoading: '900',
            clickable: 'true',
            validate: 'true',
        }, options);

        var waitClickMs = parseInt(String(settings.waitClick), 10);
        if (isNaN(waitClickMs) || waitClickMs < 0) {
            waitClickMs = 500;
        }

        function radioNavigationEnabled() {
            var c = settings.clickable;
            if (c === false || c === 'false' || c === 0 || c === '0' || c === '') {
                return false;
            }
            return true;
        }

        return this.each(function () {

            var $container = $(this);

            /* Calling onlineForm multiple times stacks duplicate delegated handlers + timeouts,
             * which breaks navigation after closing validation quickly. */
            if ($container.data('uniqueraOnlineFormInitialized')) {
                return;
            }

            var loading,
                phoneInput,
                stepCreate,
                stepSelect,
                doctorImage,
                typewriter,
                continueButton,
                continueButtonHide,
                validateStepFields,
                assembleContactFormPayload,
                submitConsultationFromStep9,
                questionSettings,
                loadQuestion,
                loadQuestionBack,
                navigateToQuestion,
                loadContent,
                loadContentData,
                setPreview,
                setSlider,
                run,
                policy,
                unfinished = uniqueraSafeStorageJSON('unfinished', null),

                $root = (function () {
                    var $r = $container.closest('#onlineForm');
                    if (!$r.length) {
                        $r = $container.closest('.uniquera-form-wrap');
                    }
                    return $r.length ? $r : $container;
                }()),

                updateStepIndicator = function () {
                    var $a = $root.find('.steps .step.active');
                    var cur = ($a.length && $a.text()) ? parseInt($.trim($a.text()), 10) : 1;
                    if (isNaN(cur) || cur < 1) {
                        cur = 1;
                    }
                    var maxDisp = parseInt($root.find('.steps').attr('data-max-display'), 10);
                    if (isNaN(maxDisp) || maxDisp < 1) {
                        maxDisp = 10;
                    }
                    $root.find('.uniquera-step-indicator').text('Step ' + cur + ' of ' + maxDisp);
                },

                scrollToFormTitle = function () {
                    var $target = $root.find('.title-text').first();
                    if (!$target.length) {
                        $target = $root.find('#header').first();
                    }
                    if (!$target.length) {
                        return;
                    }
                    var top = $target.offset().top;
                    if (typeof top !== 'number') {
                        return;
                    }
                    $('html, body').stop(true).animate({ scrollTop: Math.max(0, top - 20) }, 500);
                },

                loading = function () {
                    // Prefer immediate interaction over artificial intro wait.
                    var meterEl = $('.meter');
                    meterEl.find('span').width('100%');
                    $('#loading').stop(true, true).hide();
                    $('.wrapper').show();

                };

            var lastStep = 0;
            stepCreate = function () {
                var $steps = $root.find('.steps');
                $steps.empty();

                var maxDisplay = 0;
                var displayIndex = 1;
                var i;

                for (i = 1; i <= 10; i++) {
                    maxDisplay = Math.max(maxDisplay, displayIndex);
                    $steps.append('<a href="javascript:void(0);" data-step="' + i + '" class="step hair-question">' + displayIndex + '</a>');
                    displayIndex += 1;
                }

                $steps.attr('data-max-display', String(maxDisplay));
                $('#uniquera-step-denom-style').remove();
                $('body').append(
                    '<style id="uniquera-step-denom-style" type="text/css">' +
                    '.uniquera-form-wrap #footer .steps .step.active::after{content: "";}' +
                    '</style>'
                );

                setTimeout(function () {
                    updateStepIndicator();
                }, 500);

                lastStep = 10;
            }

            var currentStep;
            stepSelect = function (questionNumber) {

                currentStep = questionNumber;

                var stepKey = questionNumber;

                var skipHairDateStep = ($root.find('input[name="experienced"]:checked').val() === 'no');

                var $steps = $root.find('.steps .step');
                $steps.removeClass('done active');
                $steps.each(function () {
                    var $s = $(this);
                    var ds = parseInt($s.attr('data-step'), 10);
                    if (isNaN(ds)) {
                        return;
                    }
                    if (ds < stepKey) {
                        /* Q5 (past transplant date) skipped when experienced=no */
                        if (skipHairDateStep && ds === 5 && stepKey <= 5) {
                            return;
                        }
                        $s.addClass('done');
                    } else if (ds === stepKey) {
                        $s.addClass('active');
                    }
                });

                updateStepIndicator();

            }

            /*phoneInput = intlTelInput(document.querySelector('#phone'), {
                initialCountry: 'auto',
                autoHideDialCode: false,
                separateDialCode: true,
                geoIpLookup: function (success, failure) {
                    $.ajax({
                        url: 'https://get.geojs.io/v1/ip/geo.json',
                        success: function (response) {
                            $('input[name="visit_ip"]').val(response.ip);
                            $('input[name="visit_city"]').val(response.city);
                            $('input[name="visit_country"]').val(response.country_code);
                            success(response.country_code);
                        }
                    });
                },
            });*/

            doctorImage = function (questionNumber) {

                $root.find('.title-image [data-step]').hide();
                $root.find('.title-image [data-step="' + questionNumber + '"]').show();

            }

            var type;
            typewriter = function (questionNumber) {
                var char = 0;

                var title = $root.find('#question-' + questionNumber).data('title');

                clearTimeout(type);

                var titleEl = $root.find('.title-text h2');
                titleEl.empty();

                function typewriter_again() {
                    if (char < title.length) {

                        titleEl.text(titleEl.text() + title.charAt(char));
                        char = char + 1;
                        type = setTimeout(typewriter_again, settings.waitType);
                    }
                }

                typewriter_again();

            }

            continueButton = function () {
                setTimeout(function () {
                    $root.find('.form-button').fadeIn(1000);
                }, 800);
            }

            continueButtonHide = function () {

                $root.find('.form-button').hide();

            }

            questionSettings = function (questionNumber) {
                settings.clickable = true;

                if (questionNumber == 1) {

                    setTimeout(function () {
                        $root.find('.form-button').hide();
                    }, 1000);

                    $root.find('.back').addClass('hide');
                    unSelectedHuman();
                    $root.find('.application').hide();
                    $root.find('.main').css('align-items', 'center');

                    //$('#human path').removeClass('selected');
                    //$('#human path.selected').trigger('click');


                } else if (questionNumber == 2) {

                    $root.find('.back').removeClass('hide');

                    $root.find('.question-female').hide();
                    $root.find('.question-male').hide();

                    if (gender == 'female') {
                        $root.find('.question-female').css('display', 'flex');
                    } else if (gender == 'male') {
                        $root.find('.question-male').css('display', 'flex');
                        continueButton();

                        settings.clickable = false;
                    }

                    $root.find('.main').css('align-items', 'center');


                } else if (questionNumber == 3) {

                    settings.clickable = true;

                    continueButton();

                } else if (questionNumber == 4) {


                } else if (questionNumber == 5) {

                    continueButton();

                } else if (questionNumber == 6) {

                    continueButton();

                } else if (questionNumber == 7) {
                    $root.find('.main').css('align-items', 'center');

                    continueButton();

                } else if (questionNumber == 8) {

                    settings.clickable = false;

                    $root.find('.form-button').html('Continue <i class="form-button-arrow"></i>');

                    continueButton();

                    setTimeout(function () {
                        localStorage.removeItem('unfinished');
                        localStorage.removeItem('human');
                    }, 500);

                } else if (questionNumber == 9) {

                    settings.clickable = false;

                    $root.find('.form-button').html('Continue <i class="form-button-arrow"></i>');

                    continueButton();

                    setTimeout(function () {
                        localStorage.removeItem('unfinished');
                        localStorage.removeItem('human');
                    }, 500);

                } else if (questionNumber == 10) {

                    settings.clickable = false;

                    $root.find('.form-button').html('Submit <i class="form-button-arrow"></i>');

                    if (!$root.data('uniqueraIntlPhoneInited')) {
                        setTimeout(function () {
                            var phoneEl = $root.find('#phone').get(0);
                            if (!phoneEl) {
                                return;
                            }
                            intlTelInput(phoneEl, {
                                initialCountry: 'auto',
                                autoHideDialCode: false,
                                separateDialCode: true,
                                geoIpLookup: function (success, failure) {
                                    $.ajax({
                                        url: 'https://get.geojs.io/v1/ip/geo.json',
                                        success: function (response) {
                                            $root.find('input[name="visitorIP"]').val(response.ip);
                                            $root.find('input[name="visitorCity"]').val(response.city);
                                            $root.find('input[name="visitorCountry"]').val(response.country_code);
                                            $root.find('input[name="contact_time_country"]').val(response.country);
                                            var cc = response.country_code;
                                            success(cc && typeof cc === 'string' ? cc : 'us');
                                        },
                                        error: function () {
                                            failure();
                                        }
                                    });
                                },
                            });
                            $root.data('uniqueraIntlPhoneInited', true);
                        }, 400);
                    }

                    continueButton();

                    $root.find('.application').hide();
                    $root.find('#footer .col').show();
                    $root.find('#footer .back').removeClass('hide');

                    setTimeout(function () {
                        localStorage.removeItem('unfinished');
                        localStorage.removeItem('human');
                    }, 500);

                }

            }

            var formData;
            var data = {};
            var key = null;

            function uniqueraValidEmailStep(e) {
                var filter = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
                return String(e).search(filter) != -1;
            }

            function removeQ9ReferralErrClassLater() {
                setTimeout(function () {
                    $root.find('#question-9').find('input').removeClass('error');
                }, 800);
            }

            function removeQ10PolicyErrLater() {
                setTimeout(function () {
                    $root.find('#question-10').find('input').removeClass('error');
                }, 800);
            }

            function uniqueraParseQ5DateInput(value) {
                var raw = String(value || '').trim();
                if (raw === '') {
                    return null;
                }

                var m;
                var year;
                var month;
                var day;

                m = raw.match(/^(\d{2})-(\d{2})-(\d{2})$/);
                if (m) {
                    month = parseInt(m[1], 10);
                    day = parseInt(m[2], 10);
                    year = parseInt(m[3], 10);
                    year = year >= 30 ? (1900 + year) : (2000 + year);
                } else {
                    m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                    if (!m) {
                        return null;
                    }
                    year = parseInt(m[1], 10);
                    month = parseInt(m[2], 10);
                    day = parseInt(m[3], 10);
                }

                if (isNaN(year) || isNaN(month) || isNaN(day)) {
                    return null;
                }

                var dt = new Date(year, month - 1, day);
                if (dt.getFullYear() !== year || dt.getMonth() !== (month - 1) || dt.getDate() !== day) {
                    return null;
                }
                if (dt < new Date(1930, 0, 1)) {
                    return null;
                }
                var today = new Date();
                var todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                if (dt > todayOnly) {
                    return null;
                }

                return {
                    year: year,
                    month: month,
                    day: day
                };
            }

            function uniqueraFormatQ5DateMmDdYy(parsed) {
                if (!parsed) {
                    return '';
                }
                var mm = parsed.month < 10 ? ('0' + parsed.month) : String(parsed.month);
                var dd = parsed.day < 10 ? ('0' + parsed.day) : String(parsed.day);
                var yy = String(parsed.year % 100);
                if (yy.length < 2) {
                    yy = '0' + yy;
                }
                return mm + '-' + dd + '-' + yy;
            }

            function uniqueraFormatQ5DateIso(parsed) {
                if (!parsed) {
                    return '';
                }
                var mm = parsed.month < 10 ? ('0' + parsed.month) : String(parsed.month);
                var dd = parsed.day < 10 ? ('0' + parsed.day) : String(parsed.day);
                return String(parsed.year) + '-' + mm + '-' + dd;
            }

            assembleContactFormPayload = function () {
                var telDialCode = $root.find('.iti__selected-dial-code').text().trim();
                var form = $root.find('form').serializeArray();

                formData = new FormData();

                form.forEach(function (fields) {
                    if (fields.name == "phone") {
                        var phoneValue = fields.value;

                        if (telDialCode === '+44' && phoneValue.startsWith('0')) {
                            phoneValue = phoneValue.substring(1);
                        }

                        formData.append(fields.name, phoneValue);
                        formData.append('country', telDialCode);
                    } else {
                        formData.append(fields.name, fields.value);
                    }
                });

                var utmParams = getUtmParameters();

                formData.set('source', utmParams.source);
                formData.set('type', utmParams.source);
                formData.set('utm_source', utmParams.utm_source);
                formData.set('utm_medium', utmParams.utm_medium);
                formData.set('utm_campaign', utmParams.utm_campaign);
                formData.set('utm_audience', utmParams.utm_audience);
                formData.set('page_url', utmParams.page_url);

                key = 'wp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 14);
                removeQ9ReferralErrClassLater();
            };

            submitConsultationFromStep9 = function () {
                var formUpdate = $root.find('form').serializeArray();
                var telDialCode = $root.find('.iti__selected-dial-code').text().trim();
                var formDataUpdate = new FormData();

                formUpdate.forEach(function (fields) {
                    if (fields.name == "phone") {
                        var phoneValue = fields.value;

                        if (telDialCode === '+44' && phoneValue.startsWith('0')) {
                            phoneValue = phoneValue.substring(1);
                        }

                        formDataUpdate.append(fields.name, phoneValue);
                        formDataUpdate.append('country', telDialCode);
                    } else {
                        formDataUpdate.append(fields.name, fields.value);
                    }
                });

                var fileInput = $root.find('#question-10 input[name="files"]')[0]
                    || $root.find('input[name="files"]')[0];
                var ins = fileInput && fileInput.files ? fileInput.files.length : 0;

                for (var x = 0; x < ins; x++) {
                    formDataUpdate.append('files[' + x + ']', fileInput.files[x]);
                }

                formDataUpdate.append('code', key);

                var utmParams = getUtmParameters();

                formDataUpdate.set('source', utmParams.source);
                formDataUpdate.set('type', utmParams.source);
                formDataUpdate.set('utm_source', utmParams.utm_source);
                formDataUpdate.set('utm_medium', utmParams.utm_medium);
                formDataUpdate.set('utm_campaign', utmParams.utm_campaign);
                formDataUpdate.set('utm_audience', utmParams.utm_audience);
                formDataUpdate.set('page_url', utmParams.page_url);

                return uniqueraSubmitToWordPressAsync(formDataUpdate);
            };

            var submitWithNonceRetry = function (buildRequestFn) {
                var dfd = $.Deferred();

                var runOnce = function () {
                    return buildRequestFn();
                };

                runOnce()
                    .done(function (resp) {
                        dfd.resolve(resp);
                    })
                    .fail(function (xhr) {
                        var invalidNonce = false;
                        if (xhr && xhr.status === 403 && xhr.responseJSON && xhr.responseJSON.data && xhr.responseJSON.data.message === 'invalid_nonce') {
                            invalidNonce = true;
                        }
                        if (!invalidNonce) {
                            dfd.reject(xhr);
                            return;
                        }

                        uniqueraFetchFreshNonceAsync()
                            .done(function (nonceResp) {
                                var nextNonce = nonceResp && nonceResp.success && nonceResp.data ? nonceResp.data.nonce : '';
                                if (typeof nextNonce !== 'string' || nextNonce === '') {
                                    dfd.reject(xhr);
                                    return;
                                }
                                if (typeof uniqueraForm !== 'undefined') {
                                    uniqueraForm.nonce = nextNonce;
                                }
                                runOnce()
                                    .done(function (resp2) { dfd.resolve(resp2); })
                                    .fail(function (xhr2) { dfd.reject(xhr2); });
                            })
                            .fail(function () {
                                dfd.reject(xhr);
                            });
                    });

                return dfd.promise();
            };

            var showValidationModal = function (messages, title) {
                var list = Array.isArray(messages) ? messages : [String(messages || '').trim()];
                list = list.filter(function (m) { return m && String(m).trim() !== ''; });
                if (!list.length) {
                    return;
                }

                $root.find('.uniquera-validation-overlay, .uniquera-validation-modal').remove();

                var modalTitle = title || 'Please complete required fields';
                var itemsHtml = list.map(function (m) { return '<li>' + m + '</li>'; }).join('');
                var overlayHtml = '<div class="uniquera-validation-overlay"></div>';
                var modalHtml = '' +
                    '<div class="uniquera-validation-modal" role="dialog" aria-modal="true" aria-label="Validation errors">' +
                    '  <div class="uniquera-validation-modal__head">' +
                    '    <h4>' + modalTitle + '</h4>' +
                    '    <button type="button" class="uniquera-validation-close" aria-label="Close">x</button>' +
                    '  </div>' +
                    '  <div class="uniquera-validation-modal__body"><ul>' + itemsHtml + '</ul></div>' +
                    '  <div class="uniquera-validation-modal__foot"><button type="button" class="uniquera-validation-ok">OK</button></div>' +
                    '</div>';

                $root.append(overlayHtml + modalHtml);

                var closeModal = function () {
                    $root.find('.uniquera-validation-overlay, .uniquera-validation-modal').remove();
                    /* Modal can close while queued navigation timers left interaction disabled. */
                    settings.clickable = true;
                    settings.validate = true;
                };
                $root.find('.uniquera-validation-overlay').on('click', closeModal);
                $root.find('.uniquera-validation-close, .uniquera-validation-ok').on('click', closeModal);
            };

            validateStepFields = function (questionNumber) {
                var q = parseInt(questionNumber, 10);
                if (isNaN(q)) {
                    settings.validate = false;
                    return false;
                }

                if (q === 1) {
                    if (!$root.find('input[name=gender]:checked').length) {
                        showValidationModal(['Please select your gender.']);
                        settings.validate = false;
                        return false;
                    }
                    settings.validate = true;
                    return true;
                }

                if (q === 2) {
                    var g = $root.find('input[name=gender]:checked').val();
                    if (g === 'female') {
                        if ($root.find('input[name=preview]:checked').length === 0) {
                            $root.find('#question-2 .question-female').addClass('error');
                            showValidationModal(['Please select your hair loss level.']);
                            settings.validate = false;
                            return false;
                        }
                        $root.find('#question-2 .question-female').removeClass('error');
                        settings.validate = true;
                        return true;
                    }
                    var front = $root.find('input[name=front]:checked').val();
                    var back = $root.find('input[name=back]:checked').val();
                    $root.find('#question-2').find('.row.validate').removeClass('error');
                    if (front == undefined) {
                        $root.find('#question-2').find('.row.validate').eq(0).addClass('error');
                        showValidationModal(['Please select your front hair loss level.']);
                        settings.validate = false;
                        return false;
                    }
                    if (back == undefined) {
                        $root.find('#question-2').find('.row.validate').eq(1).addClass('error');
                        showValidationModal(['Please select your crown hair loss level.']);
                        settings.validate = false;
                        return false;
                    }
                    settings.validate = true;
                    return true;
                }

                if (q === 3) {
                    var pv = $root.find('input[name=period]').val();
                    var pi = parseInt(pv, 10);
                    if (pv === '' || pv == null || isNaN(pi) || pi < 1 || pi > 10) {
                        showValidationModal(['Please select how long you have been experiencing hair loss.']);
                        settings.validate = false;
                        return false;
                    }
                    settings.validate = true;
                    return true;
                }

                if (q === 4) {
                    if ($root.find('input[name=experienced]:checked').length === 0) {
                        showValidationModal(['Please select whether you had a hair transplant before.']);
                        settings.validate = false;
                        return false;
                    }
                    settings.validate = true;
                    return true;
                }

                if (q === 5) {
                    var $dt = $root.find('#question-5 input[name=beforeExperienceDate]');
                    var $dtPicker = $root.find('#beforeExperienceDatePicker');
                    var bd = String($dt.val() || '').trim();
                    var parsedDate = uniqueraParseQ5DateInput(bd);
                    if (!parsedDate) {
                        $dt.addClass('error');
                        showValidationModal(['Please enter your previous hair transplant date in MM-DD-YY format.']);
                        setTimeout(function () {
                            $dt.removeClass('error');
                        }, 800);
                        settings.validate = false;
                        return false;
                    }
                    $dt.val(uniqueraFormatQ5DateMmDdYy(parsedDate));
                    if ($dtPicker.length) {
                        $dtPicker.val(uniqueraFormatQ5DateIso(parsedDate));
                    }
                    settings.validate = true;
                    return true;
                }

                if (q === 6) {
                    $root.find('.uniquera-tried-treatments.validate').removeClass('error');
                    if ($root.find('input[name="tried_treatments[]"]:checked').length === 0) {
                        $root.find('.uniquera-tried-treatments.validate').addClass('error');
                        showValidationModal(['Please select at least one treatment option.']);
                        setTimeout(function () {
                            $root.find('.uniquera-tried-treatments.validate').removeClass('error');
                        }, 1200);
                        settings.validate = false;
                        return false;
                    }
                    if ($root.find('input[name="tried_treatments[]"][value="other"]:checked').length) {
                        var triedOther = ($root.find('input[name=tried_treatments_other]').val() || '').trim();
                        if (triedOther === '') {
                            $root.find('input[name=tried_treatments_other]').addClass('error');
                            $root.find('.uniquera-tried-treatments.validate').addClass('error');
                            showValidationModal(['Please specify the "Other" treatment.']);
                            setTimeout(function () {
                                $root.find('input[name=tried_treatments_other]').removeClass('error');
                                $root.find('.uniquera-tried-treatments.validate').removeClass('error');
                            }, 1200);
                            settings.validate = false;
                            return false;
                        }
                    }
                    settings.validate = true;
                    return true;
                }

                if (q === 7) {
                    if ($root.find('input[name=date]:checked').length === 0) {
                        showValidationModal(['Please choose when you intend to have a hair transplant.']);
                        settings.validate = false;
                        return false;
                    }
                    settings.validate = true;
                    return true;
                }

                if (q === 8) {
                    /* Optional step: allow continue without text */
                    $root.find('#question-8 textarea[name=medicines]').removeClass('error');
                    settings.validate = true;
                    return true;
                }

                if (q === 9) {
                    $root.find('#question-9').find('input').removeClass('error');
                    $root.find('#question-9 .uniquera-referral-section').removeClass('error');

                    if ($root.find('input[name=referral_source]:checked').length === 0) {
                        $root.find('#question-9 .uniquera-referral-section').addClass('error');
                        showValidationModal(['Please select how you got to know about us.']);
                        setTimeout(function () {
                            $root.find('#question-9 .uniquera-referral-section').removeClass('error');
                        }, 1200);
                        settings.validate = false;
                        return false;
                    }

                    settings.validate = true;
                    return true;
                }

                if (q === 10) {
                    var clearStep10Err = function () {
                        setTimeout(function () {
                            $root.find('#question-10 .uniquera-step9-field').removeClass('has-error');
                            $root.find('#question-10 .uniquera-q9-english.validate, #question-10 .uniquera-q9-travel.validate').removeClass('error');
                            $root.find('#question-10 .form-control').removeClass('error');
                            $root.find('#question-10 input[name="consent_info_processing"], #question-10 input[name="consent_information_accuracy"], #question-10 input[name="consent_contact_channels"]').removeClass('error');
                        }, 1400);
                    };

                    $root.find('#question-10 .uniquera-step9-field').removeClass('has-error');
                    $root.find('#question-10 .uniquera-q9-english.validate, #question-10 .uniquera-q9-travel.validate').removeClass('error');
                    $root.find('#question-10 .form-control').removeClass('error');
                    $root.find('#question-10 input[name="consent_info_processing"], #question-10 input[name="consent_information_accuracy"], #question-10 input[name="consent_contact_channels"]').removeClass('error');

                    var s9name = ($root.find('input[name=fullName]').val() || '').trim();
                    var s9email = ($root.find('input[name=email]').val() || '').trim();
                    var s9phone = ($root.find('input[name=phone]').val() || '').trim();
                    var s9phoneDigits = s9phone.replace(/\D/g, '');
                    var step10Errors = [];

                    if (s9name === '') {
                        $root.find('input[name=fullName]').addClass('error').closest('.uniquera-step9-field').addClass('has-error');
                        step10Errors.push('Full Name is required.');
                    }
                    if (s9email === '' || !uniqueraValidEmailStep(s9email)) {
                        $root.find('input[name=email]').addClass('error').closest('.uniquera-step9-field').addClass('has-error');
                        step10Errors.push('Please enter a valid E-Mail Address.');
                    }
                    if (s9phone === '' || !/^[0-9]+$/.test(s9phone) || s9phoneDigits.length < 7) {
                        $root.find('input[name=phone]').addClass('error').closest('.uniquera-step9-field').addClass('has-error');
                        step10Errors.push('Telephone Number must contain digits only (minimum 7 digits).');
                    }

                    if ($root.find('input[name=speaks_english]:checked').length === 0) {
                        $root.find('#question-10 .uniquera-q9-english.validate').addClass('error');
                        step10Errors.push('Please select if you speak English.');
                    }
                    var seVal = $root.find('input[name=speaks_english]:checked').val();
                    if (seVal === 'other') {
                        var seOther = ($root.find('input[name=speaks_english_other]').val() || '').trim();
                        if (seOther === '') {
                            $root.find('input[name=speaks_english_other]').addClass('error');
                            $root.find('#question-10 .uniquera-q9-english.validate').addClass('error');
                            step10Errors.push('Please specify language in "Do you speak English? - Other".');
                        }
                    }

                    if ($root.find('input[name=travel_istanbul]:checked').length === 0) {
                        $root.find('#question-10 .uniquera-q9-travel.validate').addClass('error');
                        step10Errors.push('Please select your travel preference for Istanbul.');
                    }

                    var pol1 = $root.find('input[name="consent_info_processing"]').is(':checked');
                    var pol2 = $root.find('input[name="consent_information_accuracy"]').is(':checked');
                    var pol3 = $root.find('input[name="consent_contact_channels"]').is(':checked');

                    $root.find('#question-10 input[name="consent_info_processing"], #question-10 input[name="consent_information_accuracy"], #question-10 input[name="consent_contact_channels"]').removeClass('error');

                    if (!pol1) {
                        $root.find('#question-10 input[name="consent_info_processing"]').addClass('error');
                        step10Errors.push('Please accept consent for information processing.');
                    }
                    if (!pol2) {
                        $root.find('#question-10 input[name="consent_information_accuracy"]').addClass('error');
                        step10Errors.push('Please confirm information accuracy.');
                    }
                    if (!pol3) {
                        $root.find('#question-10 input[name="consent_contact_channels"]').addClass('error');
                        step10Errors.push('Please accept contact via WhatsApp/Phone/Email.');
                    }

                    if (step10Errors.length) {
                        showValidationModal(step10Errors, 'Please complete Step 10');
                        removeQ10PolicyErrLater();
                        clearStep10Err();
                        settings.validate = false;
                        return false;
                    }
                    settings.validate = true;
                    return true;
                }

                settings.validate = true;
                return true;
            };


            var stepAtla = 0;

            /* SPA hosts full thank-you route (React); always navigate off the embedded form shell. */
            function showInlineThankYouAndRedirect() {
                var redirectTarget = uniqueraResolveThankYouRedirectUrl();

                uniqueraSignalConsultationFormSubmit({
                    event: 'uniquera_consultation_form_submit_success',
                    funnel_step: 'server_accepted_pending_redirect',
                    confirmation_url: redirectTarget
                });

                try {
                    window.sessionStorage.setItem('uniquera_cf_confirmation_pending', '1');
                } catch (_eSs) {}

                window.setTimeout(function () {
                    try {
                        window.location.assign(redirectTarget);
                    } catch (_eNav) {
                        window.location.href = redirectTarget;
                    }
                }, 0);
            }

            loadQuestion = function (currentQuestionNumber) {

                if (currentQuestionNumber >= 1) {
                    if (!validateStepFields(currentQuestionNumber)) {
                        return;
                    }
                    if (currentQuestionNumber === 9) {
                        assembleContactFormPayload();
                    } else if (currentQuestionNumber === 10) {
                        if (typeof uniqueraForm === 'undefined' || !uniqueraForm.ajaxUrl) {
                            settings.validate = false;
                            window.alert('Form could not be submitted. Please refresh the page and try again.');
                            return;
                        }
                        var $submitBtn = $root.find('.form-button');
                        var $loader = uniqueraShowSubmitLoader($root);
                        $submitBtn.prop('disabled', true);
                        var runSubmit = function () {
                            submitWithNonceRetry(submitConsultationFromStep9)
                                .always(function () {
                                    $loader.remove();
                                    $submitBtn.prop('disabled', false);
                                })
                                .done(function (respRaw) {
                                    var resp = uniqueraCoerceAjaxJson(respRaw);
                                    if (resp && resp.success) {
                                        settings.validate = true;
                                        try {
                                            localStorage.removeItem('unfinished');
                                            localStorage.removeItem('human');
                                        } catch (e) {
                                            /* ignore */
                                        }
                                        uniqueraPostConsultationWebhookFromRoot($root);
                                        showInlineThankYouAndRedirect();
                                    } else {
                                        settings.validate = false;
                                        window.alert(typeof uniqueraForm !== 'undefined' && typeof uniqueraForm.submitError === 'string' ? uniqueraForm.submitError : 'Could not submit your form. Please try again.');
                                    }
                                })
                                .fail(function (xhr) {
                                    settings.validate = false;
                                    if (xhr && xhr.status === 413) {
                                        window.alert('Upload too large for the server limit. Try smaller images or fewer files.');
                                    } else if (xhr && xhr.status === 503) {
                                        window.alert('Server busy or timeout. Please try again with smaller images.');
                                    } else {
                                        window.alert(typeof uniqueraForm !== 'undefined' && typeof uniqueraForm.submitError === 'string' ? uniqueraForm.submitError : 'Could not submit your form. Please try again.');
                                    }
                                });
                        };
                        if (typeof window.requestAnimationFrame === 'function') {
                            window.requestAnimationFrame(runSubmit);
                        } else {
                            window.setTimeout(runSubmit, 0);
                        }
                        return;
                    }
                }

                $root.find('.question').hide();

                continueButtonHide();

                if (currentQuestionNumber >= 1) {
                    $root.find('.back').removeClass('hide');
                }


                var nextQuestionNumber = currentQuestionNumber + 1;

                if (currentQuestionNumber === 4) {
                    var expAns = $root.find('input[name="experienced"]:checked').val();
                    if (expAns === 'no') {
                        nextQuestionNumber = 6;
                    }
                }


                /*stepAtla = 0;
                if(currentQuestionNumber==3){
                    if($root.find('#sacpath.selected').length < 2){

                        if(stepAtla==0){

                            nextQuestionNumber = 10;
                            stepAtla = 1;

                        }

                    }
                }*/

                questionSettings(nextQuestionNumber);
                doctorImage(nextQuestionNumber);

                $root.find('#question-' + nextQuestionNumber).fadeIn(1000);
                if (currentQuestionNumber >= 1) {
                    scrollToFormTitle();
                }

                $root.find('#question-' + currentQuestionNumber).removeClass('active');
                $root.find('#question-' + nextQuestionNumber).addClass('active');

                typewriter(nextQuestionNumber);

                var currentQuestionData = nextQuestionNumber;

                stepSelect(nextQuestionNumber);

                currentStepData = nextQuestionNumber;

                var data = {
                    "currentQuestion": currentQuestionData,
                    "currentStep": currentStep,
                    "language": language,
                    "updatedAt": Date.now(),
                    "formFlowVersion": 5,
                    "data": $root.find('form').serializeArray()
                };

                localStorage.setItem('unfinished', JSON.stringify(data));

                if (currentStep >= 15) {
                    localStorage.removeItem('unfinished');
                }

            }

            var stepAtlaGeri = 0;

            navigateToQuestion = function (targetQ) {
                if (targetQ < 1) {
                    return;
                }
                var $panel = $root.find('#question-' + targetQ);
                if (!$panel.length) {
                    return;
                }

                var $curActive = $root.find('.question.active').first();
                var rawCur = $curActive.attr('data-question');
                var currentQNav = rawCur != null && rawCur !== '' ? parseInt(rawCur, 10) : NaN;
                if (!isNaN(currentQNav) && targetQ > currentQNav) {
                    return;
                }

                $root.find('.question').stop(true, true).hide().removeClass('active');
                $panel.show().addClass('active');

                if (targetQ === 1) {
                    $root.find('.back').addClass('hide');
                } else {
                    $root.find('.back').removeClass('hide');
                }

                stepSelect(targetQ);
                currentStepData = targetQ;
                continueButtonHide();
                doctorImage(targetQ);
                questionSettings(targetQ);
                typewriter(targetQ);
                scrollToFormTitle();

                try {
                    var data = {
                        currentQuestion: targetQ,
                        currentStep: currentStep,
                        language: language,
                        updatedAt: Date.now(),
                        formFlowVersion: 5,
                        data: $root.find('form').serializeArray()
                    };
                    localStorage.setItem('unfinished', JSON.stringify(data));
                    if (currentStep >= 15) {
                        localStorage.removeItem('unfinished');
                    }
                } catch (e) {
                    /* ignore quota / private mode */
                }
            };

            loadQuestionBack = function () {

                var $active = $container.find('.question.active').first();
                if (!$active.length) {
                    $active = $root.find('.question.active').first();
                }
                var rawActive = $active.attr('data-question');
                var aktifEkran = rawActive != null && rawActive !== '' ? parseInt(rawActive, 10) : NaN;
                if (isNaN(aktifEkran) || aktifEkran <= 1) {
                    return false;
                }

                var prevNumber = aktifEkran - 1;

                if (aktifEkran === 6 && $root.find('input[name="experienced"]:checked').val() === 'no') {
                    prevNumber = 4;
                }

                if (prevNumber < 1) {
                    return false;
                }

                navigateToQuestion(prevNumber);
                scrollToFormTitle();

                return false;
            }

            var currentStepData = 0;

            function migrateLegacyQuestionIndex(q) {
                var n = parseInt(q, 10);
                if (isNaN(n) || n < 1) {
                    return 1;
                }
                if (n === 1) {
                    return 1;
                }
                if (n <= 3) {
                    return 2;
                }
                if (n === 4) {
                    return 2;
                }
                if (n === 5) {
                    return 3;
                }
                if (n >= 6 && n <= 12) {
                    return n - 3;
                }
                if (n === 13) {
                    return 10;
                }
                return n;
            }

            loadContent = function () {
                var currentQuestion = 0;
                if (unfinished != null) {
                    if (unfinished.formFlowVersion === 5) {
                        currentQuestion = parseInt(unfinished.currentQuestion, 10) || 0;
                    } else if (unfinished.formFlowVersion === 4) {
                        currentQuestion = parseInt(unfinished.currentQuestion, 10) || 0;
                        if (currentQuestion === 11) {
                            currentQuestion = 10;
                        }
                        if (currentQuestion > 10) {
                            currentQuestion = 10;
                        }
                    } else if (unfinished.formFlowVersion === 3) {
                        currentQuestion = parseInt(unfinished.currentQuestion, 10) || 0;
                        if (currentQuestion >= 6 && currentQuestion <= 10) {
                            currentQuestion += 1;
                        }
                        if (currentQuestion > 11) {
                            currentQuestion = 11;
                        }
                        if (currentQuestion === 11) {
                            currentQuestion = 10;
                        }
                        if (currentQuestion > 10) {
                            currentQuestion = 10;
                        }
                    } else if (unfinished.formFlowVersion === 2) {
                        currentQuestion = parseInt(unfinished.currentQuestion, 10) || 0;
                        if (currentQuestion >= 10) {
                            currentQuestion = 9;
                        }
                    } else {
                        currentQuestion = migrateLegacyQuestionIndex(unfinished.currentQuestion);
                    }
                    currentStepData = unfinished.currentStep;

                    currentStep = unfinished.currentStep;
                    $.each(unfinished.data, function (index, input) {
                        if (input.value != null && input.value != "") {
                            updateInput(input.name, input.value);
                        }
                    });

                    gender = unfinished.data[0].value;

                    var get_language = unfinished.language;

                    if (get_language != language) {
                        localStorage.removeItem('unfinished');
                        localStorage.removeItem('human');
                        location.reload();
                    }

                }

                loadContentData(currentQuestion);

                /*setTimeout(function(){
                  if($('#sacpath.selected').length >= 1){
                      hairSelected('sac',currentStep);
                 }
                },500);*/

            }

            loadContentData = function (currentQuestion) {

                $root.find('.question').hide();

                continueButtonHide();

                if (currentQuestion >= 1) {
                    $root.find('.back').removeClass('hide');
                }

                questionSettings(currentQuestion);

                doctorImage(currentQuestion);

                $root.find('#question-' + currentQuestion).fadeIn(1000);

                $root.find('#question-' + currentQuestion).addClass('active');

                typewriter(currentQuestion);

                stepSelect(currentQuestion);

            }

            var sliderEl = $root.find('#slider').get(0);

            function updateInput(name, value) {
                var input = $("[name=" + name + "]");
                var type = input.attr('type');
                switch (type) {
                    case 'radio':
                        input.val([value]);
                        $("[name=" + name + "]:checked").next().find('.option-text').addClass('selected');
                        break;
                    case 'hidden':
                        $(input).val(value);
                        break;
                    case 'date':
                        $(input).val(value);
                        break;
                    case undefined:
                        $(input).text(value);
                        break;
                    case 'text':
                        if (name == 'period' && sliderEl && sliderEl.noUiSlider) {
                            sliderEl.noUiSlider.set(value);
                        } else if (name == 'beforeExperienceDate') {
                            var parsedQ5 = uniqueraParseQ5DateInput(value);
                            $(input).val(parsedQ5 ? uniqueraFormatQ5DateMmDdYy(parsedQ5) : value);
                            if (parsedQ5) {
                                $root.find('#beforeExperienceDatePicker').val(uniqueraFormatQ5DateIso(parsedQ5));
                            }
                        } else {
                            $(input).val(value);
                        }
                        break;
                }
            }

            var previewEl = $root.find('#preview');
            var fadeSpeed = 500;
            var previewFrontEl = $root.find('input[name="front"]');
            var previewBackEl = $root.find('input[name="back"]');
            var previewBackVal;

            setPreview = function (side, value) {
                if (side == 'front') {
                    var previewFrontVal = value;
                    if (value == '0') {
                        previewBackEl.filter('[value="0"]').closest('[class^="col-"]').fadeOut((fadeSpeed / 10));
                        if (previewBackVal == '0') {
                            previewBackVal = undefined;
                            previewBackEl.prop('checked', false);
                        }
                    } else {
                        previewBackEl.filter('[value="0"]').closest('[class^="col-"]').fadeIn((fadeSpeed / 10));
                    }
                    previewEl.find('[id^="front-"]').stop().fadeOut((fadeSpeed / 10), function () {
                        previewEl.find('[id="front-' + value + '"]').stop().fadeIn((fadeSpeed / 10));
                    });
                } else if (side == 'back') {
                    previewBackVal = value;
                    if (value == '0') {
                        previewFrontEl.filter('[value="0"]').closest('[class^="col-"]').fadeOut((fadeSpeed / 10));
                        if (previewFrontVal == '0') {
                            previewFrontVal = undefined;
                            previewFrontEl.prop('checked', false);
                        }
                    } else {
                        previewFrontEl.filter('[value="0"]').closest('[class^="col-"]').fadeIn((fadeSpeed / 10));
                    }
                    previewEl.find('[id^="back-"]').stop().fadeOut((fadeSpeed / 10), function () {
                        previewEl.find('[id="back-' + value + '"]').stop().fadeIn((fadeSpeed / 10));
                    });
                }
            };

            var periodEl = $root.find('input[name="period"]');

            setSlider = function () {

                if (!sliderEl) {
                    return;
                }

                var lang = $('html').attr('lang');

                if (lang == "ar" || lang == "he") {
                    noUiSlider.create(sliderEl, {
                        start: 1,
                        step: 1,
                        range: {'min': 1, 'max': 10},
                        connect: [true, false],
                        direction: 'rtl'
                    });
                } else {
                    noUiSlider.create(sliderEl, {
                        start: 1,
                        step: 1,
                        range: {'min': 1, 'max': 10},
                        connect: [true, false],
                    });
                }

                sliderEl.noUiSlider.on('update', function () {
                    periodEl.val(Math.round(sliderEl.noUiSlider.get()));
                });
            };
            setSlider();

            var gender;
            var toggleSpeaksEnglishOtherInput = function () {
                var selectedVal = $root.find('input[name=speaks_english]:checked').val();
                var $otherWrap = $root.find('#question-10 .uniquera-se-other-wrap');
                var $otherInput = $root.find('#question-10 input[name=speaks_english_other]');
                if (selectedVal === 'other') {
                    $otherWrap.stop(true, true).slideDown(140);
                } else {
                    $otherWrap.stop(true, true).slideUp(120);
                    $otherInput.removeClass('error').val('');
                }
            };

            var applyRadioSelection = function ($radio) {
                if (!$radio || !$radio.length) {
                    return;
                }
                var rawQ = $radio.parents('.question-content').find('.question.active').first().attr('data-question');
                if (rawQ == null || rawQ === '') {
                    rawQ = $radio.closest('.question').attr('data-question');
                }
                var currentQuestionNumber = rawQ != null && rawQ !== '' ? parseInt(rawQ, 10) : NaN;

                var name = $radio.attr('name');
                var val = $radio.val();

                gender = $root.find('input[name=gender]:checked').val();

                if (gender == "male") {
                    setPreview(name, val);
                }

                if (!isNaN(currentQuestionNumber)) {
                    $root.find('#question-' + currentQuestionNumber).find('.validate').removeClass('error');
                }

                $radio.closest('.row').find('.option-text').removeClass('selected');
                $radio.next('.option').find('.option-text').addClass('selected');

                if (name === 'speaks_english') {
                    toggleSpeaksEnglishOtherInput();
                }

                if (!radioNavigationEnabled()) {
                    return;
                }

                window.clearTimeout($radio.data('uniqueraLoadQ'));
                var loadQuestionTime = window.setTimeout(function () {
                    if (!isNaN(currentQuestionNumber)) {
                        loadQuestion(currentQuestionNumber);
                    }
                }, waitClickMs);
                $radio.data('uniqueraLoadQ', loadQuestionTime);
            };

            /* Remember if this radio was already selected (back navigation); change won't fire on re-click. */
            $root.on('mousedown', '.radio-select input[type="radio"]', function () {
                $(this).data('uniqueraWasCheckedMd', $(this).prop('checked'));
            });

            $root.on('click', '.radio-select input[type="radio"]', function () {
                var $inp = $(this);
                if ($inp.data('uniqueraWasCheckedMd') && $inp.prop('checked')) {
                    applyRadioSelection($inp);
                }
                $inp.removeData('uniqueraWasCheckedMd');
            });

            /* Clicks often land on <object> SVG / decorations instead of the invisible radio. */
            $root.on('click', '.radio-select', function (e) {
                if ($(e.target).is('input[type="radio"]')) {
                    return;
                }
                var $inp = $(this).find('input[type="radio"]').first();
                if (!$inp.length) {
                    return;
                }
                if ($inp.prop('checked')) {
                    applyRadioSelection($inp);
                } else {
                    $inp.prop('checked', true).trigger('change');
                }
            });

            $root.on('change', '.radio-select input[type="radio"]', function () {
                applyRadioSelection($(this));
            });

            $root.find('.form-button').on('click', function (event) {


                var rawQB = $(this).parents('.question-content').find('.question.active').first().attr('data-question');
                var currentQuestionNumber = rawQB != null && rawQB !== '' ? parseInt(rawQB, 10) : NaN;

                if (isNaN(currentQuestionNumber)) {
                    event.preventDefault();
                    return false;
                }

                $(this).closest('.row').find('.option-text').removeClass('selected');
                $(this).next('.option').find('.option-text').addClass('selected');

                var loadQuestionTime = window.setTimeout(function () {
                    if (!isNaN(currentQuestionNumber)) {
                        loadQuestion(currentQuestionNumber);
                    }
                }, waitClickMs);

            });

            $root.on('focus input', '#question-10 input[name=speaks_english_other]', function () {
                var $otherRadio = $root.find('input[name=speaks_english][value=other]');
                if (!$otherRadio.prop('checked')) {
                    $otherRadio.prop('checked', true).trigger('change');
                } else {
                    toggleSpeaksEnglishOtherInput();
                }
            });

            run = function () {

                if ($root.closest('.uniquera-form-wrap').length) {
                    $root.find('#loading').hide();
                    $root.find('.wrapper').show();
                } else {
                    loading();
                }

                stepCreate();
                toggleSpeaksEnglishOtherInput();
                (function initPriorTransplantDateBounds() {
                    var el = $root.find('#beforeExperienceDate').get(0);
                    var pickerEl = $root.find('#beforeExperienceDatePicker').get(0);
                    var $q5Wrap = $root.find('#question-5 .uniquera-q5-date-wrap');
                    var calEl = $root.find('#beforeExperienceDateCalendar').get(0);
                    if (!el) {
                        return;
                    }
                    var now = new Date();
                    var y = now.getFullYear();
                    var m = now.getMonth() + 1;
                    var d = now.getDate();
                    var maxIso = y + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
                    el.setAttribute('data-max-date', maxIso);
                    var minDateObj = new Date(1930, 0, 1, 12, 0, 0, 0);
                    var maxDateObj = new Date(y, m - 1, d, 12, 0, 0, 0);
                    if (pickerEl) {
                        pickerEl.setAttribute('max', maxIso);
                        pickerEl.setAttribute('min', '1930-01-01');
                        $(pickerEl).on('change', function () {
                            var parsed = uniqueraParseQ5DateInput($(this).val());
                            if (!parsed) {
                                return;
                            }
                            $(el).val(uniqueraFormatQ5DateMmDdYy(parsed)).trigger('change');
                        });
                    }
                    if (!calEl) {
                        return;
                    }
                    var titleEl = calEl.querySelector('.uniquera-date-calendar__title');
                    var daysEl = calEl.querySelector('.uniquera-date-calendar__days');
                    var prevBtn = calEl.querySelector('.uniquera-date-calendar__nav[data-dir="-1"]');
                    var nextBtn = calEl.querySelector('.uniquera-date-calendar__nav[data-dir="1"]');
                    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                        'August', 'September', 'October', 'November', 'December'];
                    var viewYear = maxDateObj.getFullYear();
                    var viewMonth = maxDateObj.getMonth();
                    var selectedDate = null;

                    function sameDay(a, b) {
                        return !!(a && b
                            && a.getFullYear() === b.getFullYear()
                            && a.getMonth() === b.getMonth()
                            && a.getDate() === b.getDate());
                    }

                    function toIsoDate(dt) {
                        var yy = dt.getFullYear();
                        var mm = dt.getMonth() + 1;
                        var dd = dt.getDate();
                        return yy + '-' + (mm < 10 ? '0' : '') + mm + '-' + (dd < 10 ? '0' : '') + dd;
                    }

                    function parseIsoDateSafe(value) {
                        var p = uniqueraParseQ5DateInput(value);
                        if (!p) {
                            return null;
                        }
                        return new Date(p.year, p.month - 1, p.day, 12, 0, 0, 0);
                    }

                    function clampViewMonth() {
                        var minMonthKey = minDateObj.getFullYear() * 12 + minDateObj.getMonth();
                        var maxMonthKey = maxDateObj.getFullYear() * 12 + maxDateObj.getMonth();
                        var currentKey = viewYear * 12 + viewMonth;
                        if (currentKey < minMonthKey) {
                            viewYear = minDateObj.getFullYear();
                            viewMonth = minDateObj.getMonth();
                        } else if (currentKey > maxMonthKey) {
                            viewYear = maxDateObj.getFullYear();
                            viewMonth = maxDateObj.getMonth();
                        }
                    }

                    function parseMonthInput(raw) {
                        var value = String(raw || '').trim();
                        if (!value) {
                            return null;
                        }
                        var asNum = parseInt(value, 10);
                        if (!isNaN(asNum) && asNum >= 1 && asNum <= 12) {
                            return asNum - 1;
                        }
                        var lowered = value.toLowerCase();
                        var idx;
                        for (idx = 0; idx < monthNames.length; idx++) {
                            var mn = monthNames[idx].toLowerCase();
                            if (mn === lowered || mn.indexOf(lowered) === 0) {
                                return idx;
                            }
                        }
                        return null;
                    }

                    function jumpToMonthYear(monthRaw, yearRaw) {
                        var nextMonth = parseMonthInput(monthRaw);
                        var nextYear = parseInt(String(yearRaw || '').trim(), 10);
                        if (nextMonth == null || isNaN(nextYear) || nextYear < 1900 || nextYear > 2100) {
                            return false;
                        }
                        viewMonth = nextMonth;
                        viewYear = nextYear;
                        clampViewMonth();
                        renderCalendar();
                        return true;
                    }

                    var pickerWrap = null;
                    function closeMonthYearPicker() {
                        if (pickerWrap && pickerWrap.parentNode) {
                            pickerWrap.parentNode.removeChild(pickerWrap);
                        }
                        pickerWrap = null;
                    }

                    function openMonthYearPicker() {
                        if (!titleEl || !calEl) {
                            return;
                        }
                        if (pickerWrap) {
                            closeMonthYearPicker();
                            return;
                        }

                        pickerWrap = document.createElement('div');
                        pickerWrap.className = 'uniquera-date-calendar__picker';

                        var monthSel = document.createElement('select');
                        monthSel.className = 'uniquera-date-calendar__picker-month';
                        var mi;
                        for (mi = 0; mi < monthNames.length; mi++) {
                            var opt = document.createElement('option');
                            opt.value = String(mi);
                            opt.textContent = monthNames[mi];
                            monthSel.appendChild(opt);
                        }
                        monthSel.value = String(viewMonth);

                        var yearSel = document.createElement('select');
                        yearSel.className = 'uniquera-date-calendar__picker-year';
                        var minYear = minDateObj.getFullYear();
                        var maxYear = maxDateObj.getFullYear();
                        var yi;
                        for (yi = maxYear; yi >= minYear; yi--) {
                            var yopt = document.createElement('option');
                            yopt.value = String(yi);
                            yopt.textContent = String(yi);
                            yearSel.appendChild(yopt);
                        }
                        yearSel.value = String(viewYear);

                        pickerWrap.appendChild(monthSel);
                        pickerWrap.appendChild(yearSel);

                        // Insert right under the title (same head row)
                        titleEl.parentNode.insertBefore(pickerWrap, titleEl.nextSibling);

                        function apply() {
                            var m = parseInt(String(monthSel.value || '0'), 10);
                            var y = parseInt(String(yearSel.value || ''), 10);
                            if (!isNaN(m) && !isNaN(y)) {
                                viewMonth = m;
                                viewYear = y;
                                clampViewMonth();
                                renderCalendar();
                            }
                        }

                        monthSel.addEventListener('change', apply);
                        yearSel.addEventListener('change', apply);

                        // Wheel on month select: change month quickly
                        monthSel.addEventListener('wheel', function (evt) {
                            evt.preventDefault();
                            var delta = evt.deltaY > 0 ? 1 : -1;
                            var nm = viewMonth + delta;
                            var ny = viewYear;
                            if (nm < 0) {
                                nm = 11;
                                ny -= 1;
                            } else if (nm > 11) {
                                nm = 0;
                                ny += 1;
                            }
                            viewMonth = nm;
                            viewYear = ny;
                            clampViewMonth();
                            renderCalendar();
                            monthSel.value = String(viewMonth);
                            yearSel.value = String(viewYear);
                        }, { passive: false });

                        // Close picker if you click elsewhere in the calendar
                        window.setTimeout(function () {
                            $(document).on('mousedown.uniqueraMonthYear', function (evt) {
                                if (!pickerWrap) return;
                                if ($(calEl).has(evt.target).length === 0) {
                                    closeMonthYearPicker();
                                    $(document).off('mousedown.uniqueraMonthYear');
                                }
                            });
                        }, 0);
                    }

                    function syncFromCurrentValue() {
                        var parsed = parseIsoDateSafe($(el).val());
                        if (!parsed && pickerEl) {
                            parsed = parseIsoDateSafe($(pickerEl).val());
                        }
                        selectedDate = parsed;
                        if (selectedDate) {
                            viewYear = selectedDate.getFullYear();
                            viewMonth = selectedDate.getMonth();
                        } else {
                            viewYear = maxDateObj.getFullYear();
                            viewMonth = maxDateObj.getMonth();
                        }
                        clampViewMonth();
                    }

                    function closeCalendar() {
                        $(calEl).removeClass('is-open').attr('aria-hidden', 'true');
                    }

                    function renderCalendar() {
                        clampViewMonth();
                        if (titleEl) {
                            titleEl.textContent = monthNames[viewMonth] + ' ' + String(viewYear);
                        }
                        if (!daysEl) {
                            return;
                        }
                        daysEl.innerHTML = '';
                        var firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
                        var monthDays = new Date(viewYear, viewMonth + 1, 0).getDate();
                        var i;
                        for (i = 0; i < firstWeekday; i++) {
                            daysEl.insertAdjacentHTML('beforeend', '<button type="button" class="uniquera-date-calendar__day" disabled></button>');
                        }
                        for (i = 1; i <= monthDays; i++) {
                            var dayDate = new Date(viewYear, viewMonth, i, 12, 0, 0, 0);
                            var disabled = dayDate < minDateObj || dayDate > maxDateObj;
                            var selectedClass = sameDay(dayDate, selectedDate) ? ' is-selected' : '';
                            daysEl.insertAdjacentHTML(
                                'beforeend',
                                '<button type="button" class="uniquera-date-calendar__day' + selectedClass + '" data-iso="' + toIsoDate(dayDate) + '"' +
                                (disabled ? ' disabled' : '') + '>' + i + '</button>'
                            );
                        }
                        if (prevBtn) {
                            prevBtn.disabled = (viewYear * 12 + viewMonth) <= (minDateObj.getFullYear() * 12 + minDateObj.getMonth());
                        }
                        if (nextBtn) {
                            nextBtn.disabled = (viewYear * 12 + viewMonth) >= (maxDateObj.getFullYear() * 12 + maxDateObj.getMonth());
                        }
                    }

                    function setSelectedDateFromIso(iso) {
                        var parsed = parseIsoDateSafe(iso);
                        if (!parsed) {
                            return;
                        }
                        selectedDate = parsed;
                        var parts = {
                            year: parsed.getFullYear(),
                            month: parsed.getMonth() + 1,
                            day: parsed.getDate()
                        };
                        $(el).val(uniqueraFormatQ5DateMmDdYy(parts)).trigger('change');
                        if (pickerEl) {
                            $(pickerEl).val(uniqueraFormatQ5DateIso(parts));
                        }
                        closeCalendar();
                    }

                    function openCalendar() {
                        syncFromCurrentValue();
                        renderCalendar();
                        $(calEl).addClass('is-open').attr('aria-hidden', 'false');
                    }

                    $(el).on('click', function (evt) {
                        evt.preventDefault();
                        openCalendar();
                    });
                    $(el).on('keydown', function (evt) {
                        if (evt.key === 'Enter' || evt.key === ' ') {
                            evt.preventDefault();
                            openCalendar();
                        } else if (evt.key === 'Escape') {
                            closeCalendar();
                        }
                    });

                    $(calEl).on('click', '.uniquera-date-calendar__day', function (evt) {
                        evt.preventDefault();
                        if (this.disabled) {
                            return;
                        }
                        var iso = String($(this).attr('data-iso') || '');
                        if (iso) {
                            setSelectedDateFromIso(iso);
                        }
                    });

                    if (prevBtn) {
                        $(prevBtn).on('click', function (evt) {
                            evt.preventDefault();
                            viewMonth -= 1;
                            if (viewMonth < 0) {
                                viewMonth = 11;
                                viewYear -= 1;
                            }
                            renderCalendar();
                        });
                    }
                    if (nextBtn) {
                        $(nextBtn).on('click', function (evt) {
                            evt.preventDefault();
                            viewMonth += 1;
                            if (viewMonth > 11) {
                                viewMonth = 0;
                                viewYear += 1;
                            }
                            renderCalendar();
                        });
                    }

                    if (titleEl) {
                        titleEl.setAttribute('role', 'button');
                        titleEl.setAttribute('tabindex', '0');
                        titleEl.setAttribute('title', 'Click to change month and year');
                        $(titleEl).on('click', function (evt) {
                            evt.preventDefault();
                            openMonthYearPicker();
                        });
                        $(titleEl).on('keydown', function (evt) {
                            if (evt.key === 'Enter' || evt.key === ' ') {
                                evt.preventDefault();
                                $(titleEl).trigger('click');
                            } else if (evt.key === 'Escape') {
                                closeMonthYearPicker();
                            }
                        });

                        // Scroll on the title changes month (fast)
                        $(titleEl).on('wheel', function (evt) {
                            evt.preventDefault();
                            var delta = evt.originalEvent && evt.originalEvent.deltaY > 0 ? 1 : -1;
                            viewMonth += delta;
                            if (viewMonth < 0) {
                                viewMonth = 11;
                                viewYear -= 1;
                            } else if (viewMonth > 11) {
                                viewMonth = 0;
                                viewYear += 1;
                            }
                            clampViewMonth();
                            renderCalendar();
                        });
                    }

                    $root.on('keydown', function (evt) {
                        if (evt.key === 'Escape') {
                            closeCalendar();
                        }
                    });

                    $(document).on('mousedown', function (evt) {
                        if (!$q5Wrap.length) {
                            return;
                        }
                        if ($q5Wrap.has(evt.target).length === 0) {
                            closeCalendar();
                        }
                    });
                })();
                if (unfinished && unfinished.updatedAt && (Date.now() - unfinished.updatedAt) > 86400000) {
                    localStorage.removeItem('unfinished');
                    localStorage.removeItem('human');
                    unfinished = null;
                }

                if (uniqueraThankYouParamPresent()) {
                    var thankYouUrl = (typeof uniqueraForm !== 'undefined'
                        && uniqueraForm.thankYouUrl
                        && String(uniqueraForm.thankYouUrl).trim())
                        ? String(uniqueraForm.thankYouUrl).trim()
                        : 'https://uniqueraclinic.com/thank-you/';
                    if (window.parent !== window) {
                        /* Inside iframe: open in new tab and reload iframe so form is fresh */
                        try { window.open(thankYouUrl, '_blank', 'noopener'); } catch (e) {}
                        window.setTimeout(function () { window.location.reload(); }, 120);
                    } else {
                        window.location.replace(thankYouUrl);
                    }
                } else if (unfinished != null) {
                    loadContent();
                } else {
                    loadQuestion(0);
                    typewriter(1);
                }

                var api = {
                    goBack: loadQuestionBack,
                    goToStep: navigateToQuestion
                };
                $container.data('uniqueraApi', api);
                var $formWrap = $container.closest('.uniquera-form-wrap');
                if ($formWrap.length) {
                    $formWrap.data('uniqueraApi', api);
                }

                window.__uniqueraFormReady = true;
                try {
                    if (typeof window.dispatchEvent === 'function') {
                        window.dispatchEvent(new CustomEvent('uniqueraFormReady', { detail: { root: $root.get(0) } }));
                    }
                } catch (e) {
                    /* ignore */
                }

            };

            var policy = function () {

                $('.policy').click(function () {

                    var url = $(this).attr('data-url');

                    $('body').append('<div class="lead-form__policy"></div>');
                    $('body').append('<div class="lead-form__policy-overlay"></div>');

                    $('body .lead-form__policy').show();
                    $('body .form__policy-overlay').show();

                    $.ajax({
                        type: "GET",
                        url: 'https://lp.uniqueraclinic.com/lead/' + url + '.php?lang=' + language,

                        data: {},
                        success: function (data) {
                            $('.lead-form__policy').html(data);
                        }
                    });

                });

                $(document).on('click', '#lead-form__policy-close, .lead-form__policy-overlay', function (e) {
                    $('body .lead-form__policy, body .lead-form__policy-overlay').remove();
                });

            }

            run();
            policy();
            $container.data('uniqueraOnlineFormInitialized', true);

        });

    };

    var uniqueraCfDocNavBound = false;
    function uniqueraCfBindDocumentNav() {
        if (uniqueraCfDocNavBound) {
            return;
        }
        uniqueraCfDocNavBound = true;
        $(document).on('click.uniqueraCF', '.uniquera-form-wrap #footer .back', function (e) {
            e.preventDefault();
            var $wrap = $(this).closest('.uniquera-form-wrap');
            var api = $wrap.data('uniqueraApi') || $wrap.find('.questions').first().data('uniqueraApi');
            if (api && typeof api.goBack === 'function') {
                api.goBack();
            }
        });
        $(document).on('click.uniqueraCF', '.uniquera-form-wrap #footer .steps .step', function (e) {
            e.preventDefault();
            var $step = $(this);
            if ($step.hasClass('hide')) {
                return;
            }
            var t = parseInt($step.attr('data-step'), 10);
            if (isNaN(t)) {
                return;
            }
            var $wrap = $step.closest('.uniquera-form-wrap');
            var api = $wrap.data('uniqueraApi') || $wrap.find('.questions').first().data('uniqueraApi');
            if (api && typeof api.goToStep === 'function') {
                api.goToStep(t);
            }
        });
    }
    uniqueraCfBindDocumentNav();


}(jQuery));

(function ($) {
    'use strict';

var data = [];

function human() {

    var human = uniqueraSafeStorageJSON('human', null);

    if (human == null) {

        var totalPath = $('.human path').length;

        for (i = 0; i <= totalPath; i++) {

            var dataPath = $('.human path').eq(i).attr('data-path');
            var title = $('.human path').eq(i).attr('data-title');

            if (dataPath != undefined) {

                data.push({
                    name: dataPath,
                    title: title,
                    app: [],
                    status: 0,
                });

            }

        }

        localStorage.setItem('human', JSON.stringify(data));

    }

}

$(document).ready(function () {

    human();

    $(document).on('click', '.accordion-title', function () {

        var status = $(this).find('.active').length;

        if (status == 0) {
            $('.accordion-text').slideUp(500);
            $('.accordion-title').find('.question-button').removeClass('active');
            $(this).find('.question-button').addClass('active');
            $(this).next().slideDown(function () {
                $(this).css('display', 'block');
            });
        } else {

            $(this).next('.accordion-text').slideUp(500);
            $('.accordion-title').find('.question-button').removeClass('active');

            status = 0;

        }

    });


    $(document).on('click', '.popup-box-title .button', function () {

        var status = $(this).closest('.popup-box-title').find('.active').length;

        if (status == 0) {

            $('.accordion-text').slideUp(500);
            $('.accordion-title').find('.button').removeClass('active');

            $(this).addClass('active');
            $(this).closest('.popup-box-title').next().slideDown();

        } else {

            $(this).closest('.popup-box-title').next().slideUp(500);
            $(this).removeClass('active');

            status = 0;

        }

    });


    $('.human path').on('click', function () {

        var human = uniqueraSafeStorageJSON('human', []);

        var path = $(this).data('path');

        var status = $('#human svg path[data-path="' + path + '"].selected').length;

        var id = human.findIndex(function (e) {
            return e.name == path
        });

        if (status == 0) {
            $('#human').find('[data-path="' + path + '"]').addClass('selected');
            human[id]['status'] = 1;
        } else {

            $('.popup .' + path + ' input').prop('checked', false);

            $('#human').find('[data-path="' + path + '"]').removeClass('selected');
            human[id]['status'] = 0;
            human[id]['app'] = [];
        }

        $('.steps .hair-question').removeClass('hide');

        //hairSelected(path);

        localStorage.setItem('human', JSON.stringify(human));

        treatmentShow();

        applicationButtonAnimate();

        applicationList();

        treatmentSelected();

        humanSelectedButton();


    });


    var i = 0;
    $('.application-button, .overlay').click(function () {

        if (i == 0) {
            $(this).addClass('selected');
            $(".application").animate({bottom: '0'}, {queue: false, duration: 500});
            i = 1;
            $('.overlay').show();

        } else {
            $(this).removeClass('selected');
            $(".application").animate({bottom: '-340px'}, {queue: false, duration: 500});
            i = 0;
            $('.overlay').hide();
        }

        $('.application').scrollTop(0);

    })


    $(document).on('click', '.popup input', function () {


        var human = uniqueraSafeStorageJSON('human', []);

        var inputName = $(this).attr('name');
        var inputId = $(this).attr('data-id');
        var inputName = $(this).attr('data-input');
        var val = $(this).attr('value');

        var idx = human.findIndex(function (e) {
            return e.name == inputId
        });
        var idx_sub = human[idx]['app'].findIndex(function (e) {
            return e.id == inputName
        });

        var checkData = $(this).attr('data-input');

        if ($(this).is(":checked")) {
            human[idx]['app'].push({id: checkData, val: val});
            localStorage.setItem('human', JSON.stringify(human));
        } else {
            //human[idx]['app'].splice(human[idx]['app'].indexOf(checkData), 1);

            human[idx]['app'].splice(idx_sub, 1);

            localStorage.setItem('human', JSON.stringify(human));

        }

        humanSelected();

        applicationList();

        applicationButtonAnimate();

    });


    $(document).on('click', '.application-item.delete', function () {

        var human = uniqueraSafeStorageJSON('human', []);

        var name = $(this).data('name');
        var id = $(this).data('id');
        var val = $(this).data('val');

        $(this).closest('.application-item').remove();
        $('.popup .' + name + ' input[data-input="' + id + '"]').prop('checked', false);


        var idx = human.findIndex(function (e) {
            return e.name == name
        });
        var idx_sub = human[idx]['app'].findIndex(function (e) {
            return e.id == id
        });

        human[idx]['app'].splice(idx_sub, 1);

        localStorage.setItem('human', JSON.stringify(human));


        applicationList();

    });

    humanSelected();

    treatments();

    treatmentSelected();

    treatmentShow();

    applicationList();

    humanSelected();

    $(document).on('click', '.human-change-button', function () {

        var $scope = $(this).closest('#onlineForm');
        if (!$scope.length) {
            $scope = $(document);
        }
        var type = $(this).data('type');
        $scope.find('.human-change-button').removeClass('hide');

        if (type == "vucut") {
            $scope.find('.human-face').css('display', 'none');
            $scope.find('.human-body').stop(true, true).fadeIn(1000);
            $scope.find('.human-change-button.vucut').addClass('hide');

        } else {
            $scope.find('.human-body').css('display', 'none');
            $scope.find('.human-face').stop(true, true).fadeIn(1000);
            $scope.find('.human-change-button.yuz').addClass('hide');
        }

    });

    $('input[value="phone"]').on('click', function () {
        $('#time').slideToggle();
    });


    $('#human path').mouseenter(function () {
        var path = $(this).data("path");
        $('.' + path).addClass("common");
    });

    $('#human path').mouseleave(function () {
        var path = $(this).data("path");
        $('.' + path).removeClass("common");
    });

    setTimeout(function () {
        if ($('#sacpath.selected').length <= 0) {
            $('#sacpath').trigger('click');
        }
    }, 500);

});//document_end


function humanSelected() {

    var human = uniqueraSafeStorageJSON('human', []);

    $.each(human, function (key, value) {

        if (value.status == 1) {

            $('#human').find('[data-path="' + value.name + '"]').addClass('selected');

        }

    });

}

var tedavi_html = "";
var islemler_html = "";
var i = 0;

function treatments() {

    var treatments = tedaviler;

    $.each(treatments, function (key, value) {

        var data_title = '<div class="popup-title"><span class="icon-' + value.id + '"></span>' + value.bolge_baslik + '</div>';

        var data_list = '<li><span class="accordion-title"></span><span class="accordion-text"></span></li>';

        var id = value.id;

        $.each(value.tedaviler, function (key, value) {

            $.each(value.islemler, function (key, value) {

                islemler_html += '<li><span class="accordion-title">' + value.islem + ' <span class="question-button">?</span></span><span class="accordion-text">' + value.aciklama + '</span></li>';

            });

            if (language != 'tr') {
                var uygulamalar = 'Our applications for ' + value.tedavi + '.';
            } else {
                var uygulamalar = value.tedavi + ' için uygulamalarımız.';
            }

            tedavi_html += '<li class="popup-box-title">' +
                '<input type="checkbox" name="human" value="' + value.tedavi + '" data-id="' + id + '" data-input="' + value.id + '" class="styled-checkbox" id="styled-checkbox-' + i + '" />' +
                '<label for="styled-checkbox-' + i + '">' + value.tedavi + '</label>' +
                '<span class="button">apps</span>' +
                '</li>' +
                '<ul class="popup-box-treatments"><li class="popup-box-title-sub">' + uygulamalar + '</li>' +
                '' + islemler_html + '</ul>';
            i++;

            islemler_html = "";

        });

        var data = '<div class="' + value.id + ' hide">' + data_title + '<ul class="popup-box-list">' + tedavi_html + '' + islemler_html + '</ul></div>';

        tedavi_html = "";

        $('.popup-content').append(data);

    });

}

function treatmentSelected() {

    var human = uniqueraSafeStorageJSON('human', []);

    $.each(human, function (key, value) {

        var name = value.name;

        $.each(value.app, function (key, value) {


            $('.popup .' + name + ' input[data-input="' + value.id + '"]').prop('checked', true);


        });

    });

}

function treatmentShow() {

    var human = uniqueraSafeStorageJSON('human', []);

    $('.popup .popup-content > div').addClass('hide');

    $.each(human, function (key, value) {


        if (value.status == 1) {

            $('.popup .popup-content .' + value.name + '').removeClass('hide');

        }

    });

}

function applicationList() {


    var human = uniqueraSafeStorageJSON('human', []);

    $('.application-list').html('');

    var totalSelected = 0;

    var totalListItem = $('.popup input:checked').length;
    $('.application-button .count-2').text(totalListItem);

    $.each(human, function (key, value) {

        if (value.status == 1) {

            var title = value.title;
            var name = value.name;

            $('.application-list').append('<div class="box ' + value.name + ' clearfix"><div class="application-item title"><span class="icon-' + value.name + '"></span>' + title + '</div>');

            $.each(value.app, function (key, value) {

                //$('.application-list .box.'+name+'').append('<div class="application-item text">'+title+' - '+value.val+' <span class="delete" data-name="'+name+'" data-id="'+value.id+'" data-value="'+value.val+'">x</span></div>')

                $('.application-list .box.' + name + '').append('<div class="application-item text delete" data-name="' + name + '" data-id="' + value.id + '" data-value="' + value.val + '">' + value.val + ' <span class="delete">x</span></div>');

            });

            $('.application-list').append('</div>');

            totalSelected++;

        }

    });

    $('.application-button .count').text(totalSelected);

}

window.applicationList = applicationList;

function applicationButtonAnimate() {

    $('.application-button .animate__animated').addClass('animate__flash');

    setTimeout(function () {
        $('.application-button .animate__animated').removeClass('animate__flash');
    }, 500);


}

function humanSelectedButton() {
    var totalSelected = $('#human path.selected').length;
    if (totalSelected >= 1) {
        $('.form-button').show();
    } else {
        $('.form-button').hide();
    }
}

function unSelectedHuman() {
    var totalPath = $('.human path').length;

    for (i = 0; i <= totalPath; i++) {

        var id = $('.human path').eq(i).attr('id');

        if ($('#' + id + '.selected').length >= 1) {
            $('#' + id + '').trigger('click');

        }


    }
}

window.humanSelectedButton = humanSelectedButton;
window.unSelectedHuman = unSelectedHuman;

function hairSelected(path, currentStep) {

    if (currentStep == null) {
        currentStep = 1;
    } else {
        currentStep = currentStep - 1;
    }

    if (path == "sac") {

        $('.hair-question').addClass('step');

        if ($('#sacpath.selected').length >= 1) {

            $('.steps').html('');
            var totalQuestion = $('.question.step.hair-question').length;

            for (var i = 1; i <= totalQuestion; i++) {
                $('.steps').append('<a href="javascript:void(0);" data-step="' + i + '" class="step">' + i + '</a>');
            }

            $('.steps .step').eq(currentStep).addClass('active');

        } else {

            $('.hair-question').removeClass('step');

            $('.steps').html('');
            var totalQuestion = $('.question.step').length;

            for (var i = 1; i <= totalQuestion; i++) {
                $('.steps').append('<a href="javascript:void(0);" data-step="' + i + '" class="step">' + i + '</a>');
            }

            $('.steps .step').eq(currentStep).addClass('active');

        }

    }

}

})(jQuery);
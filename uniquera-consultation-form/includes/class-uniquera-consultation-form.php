<?php
/**
 * Core plugin: DB, AJAX, shortcode, admin, Elementor registration.
 */

if (!defined('ABSPATH')) {
    exit;
}

final class Uniquera_Consultation_Form {

    private static $instance = null;

    /** @var bool */
    private static $form_init_script_added = false;

    /** @var bool */
    private static $form_on_page = false;

    /** @var bool Shortcode actually output (footer fallback for body class). */
    private static $form_rendered = false;

    /** @var array<string, mixed>|null Pending notification for shutdown (after JSON response). */
    private $pending_submission_email = null;

    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        register_activation_hook(UNIQUERA_CF_PATH . 'uniquera-consultation-form.php', array($this, 'activate'));

        add_action('plugins_loaded', array($this, 'maybe_upgrade_submissions_table'), 5);

        add_action('wp_enqueue_scripts', array($this, 'register_assets'), 5);
        add_action('wp', array($this, 'detect_form_on_page'), 1);
        add_action('wp_head', array($this, 'output_form_favicon'), 3);
        add_filter('body_class', array($this, 'body_class_form'));
        add_shortcode('uniquera_form', array($this, 'shortcode'));
        add_shortcode('uniquera_consultation_form', array($this, 'shortcode'));

        add_action('wp_ajax_uniquera_form_submit', array($this, 'ajax_save'));
        add_action('wp_ajax_nopriv_uniquera_form_submit', array($this, 'ajax_save'));
        add_action('wp_ajax_uniquera_form_nonce', array($this, 'ajax_nonce'));
        add_action('wp_ajax_nopriv_uniquera_form_nonce', array($this, 'ajax_nonce'));

        add_action('admin_menu', array($this, 'admin_menu'));

        add_action('elementor/widgets/register', array($this, 'register_elementor_widget'));

        add_action('wp_footer', array($this, 'footer_body_scroll_class'), 5);

        add_filter('user_has_cap', array($this, 'grant_upload_cap_during_form_ajax'), 10, 4);
        add_action('wp_mail_failed', array($this, 'log_mail_failure'));
        add_action('wp_mail_succeeded', array($this, 'log_mail_success'));
    }

    /**
     * Allow Media Library upload during our public AJAX submit (visitor is not logged in).
     *
     * @param array<string, bool> $allcaps
     * @param string[]            $caps
     * @return array<string, bool>
     */
    public function grant_upload_cap_during_form_ajax($allcaps, $caps) {
        if (!defined('DOING_AJAX') || !DOING_AJAX) {
            return $allcaps;
        }
        if (empty($_REQUEST['action']) || 'uniquera_form_submit' !== $_REQUEST['action']) {
            return $allcaps;
        }
        if (in_array('upload_files', $caps, true)) {
            $allcaps['upload_files'] = true;
        }
        return $allcaps;
    }

    /** DB schema version: bump when submissions table must be recreated (clears old rows). */
    private const SUBMISSIONS_SCHEMA_VERSION = '2';

    public function activate() {
        $this->create_submissions_table();
        update_option('uniquera_cf_schema_version', self::SUBMISSIONS_SCHEMA_VERSION);
    }

    /**
     * One-time migration: bump schema version drops and recreates submissions table (avoid if you must keep rows).
     */
    public function maybe_upgrade_submissions_table() {
        $v = get_option('uniquera_cf_schema_version', '0');
        if (version_compare((string) $v, self::SUBMISSIONS_SCHEMA_VERSION, '>=')) {
            return;
        }
        global $wpdb;
        $table = $wpdb->prefix . 'uniquera_submissions';
        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name from trusted prefix.
        $wpdb->query("DROP TABLE IF EXISTS `{$table}`");
        $this->create_submissions_table();
        update_option('uniquera_cf_schema_version', self::SUBMISSIONS_SCHEMA_VERSION);
    }

    private function create_submissions_table() {
        global $wpdb;
        $table = $wpdb->prefix . 'uniquera_submissions';
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $sql = "CREATE TABLE $table (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            created_at DATETIME,
            full_name TEXT,
            email TEXT,
            payload_json LONGTEXT,
            PRIMARY KEY (id)
        ) " . $wpdb->get_charset_collate() . ';';

        dbDelta($sql);
    }

    /**
     * Human-readable labels for email / display (same order as form flow).
     *
     * @return array<string, string>
     */
    private function get_submission_field_labels() {
        return array(
            'gender'                      => __('Gender', 'uniquera-consultation-form'),
            'front'                       => __('Hair loss (frontal)', 'uniquera-consultation-form'),
            'back'                        => __('Hair loss (crown)', 'uniquera-consultation-form'),
            'preview'                     => __('Hair loss (female pattern)', 'uniquera-consultation-form'),
            'color'                       => __('Hair color', 'uniquera-consultation-form'),
            'period'                      => __('Hair loss duration', 'uniquera-consultation-form'),
            'experienced'                 => __('Prior hair transplant', 'uniquera-consultation-form'),
            'beforeExperienceDate'        => __('Prior transplant date', 'uniquera-consultation-form'),
            'date'                        => __('Planned transplant timing', 'uniquera-consultation-form'),
            'medicines'                   => __('Any prior health conditions, medications, allergies?', 'uniquera-consultation-form'),
            'diseases'                    => __('Diseases', 'uniquera-consultation-form'),
            'planned_contact_time'        => __('Planned contact time', 'uniquera-consultation-form'),
            'preferred_language_id'       => __('Preferred language', 'uniquera-consultation-form'),
            'seconder_language_id'        => __('Second language', 'uniquera-consultation-form'),
            'code'                        => __('Submission reference', 'uniquera-consultation-form'),
            'fullName'                    => __('Full name', 'uniquera-consultation-form'),
            'email'                       => __('Email', 'uniquera-consultation-form'),
            'phone'                       => __('Phone', 'uniquera-consultation-form'),
            'country'                     => __('Phone country code', 'uniquera-consultation-form'),
            'city_country'                => __('City and country', 'uniquera-consultation-form'),
            'speaks_english'              => __('Speaks English', 'uniquera-consultation-form'),
            'speaks_english_other'        => __('Language (other)', 'uniquera-consultation-form'),
            'travel_istanbul'             => __('Willing to travel to Istanbul', 'uniquera-consultation-form'),
            'age'                         => __('Age', 'uniquera-consultation-form'),
            'sex_gender'                  => __('Sex / gender', 'uniquera-consultation-form'),
            'sex_gender_other'            => __('Sex / gender (other)', 'uniquera-consultation-form'),
            'health_conditions'           => __('Medications, allergies, conditions', 'uniquera-consultation-form'),
            'prior_treatment'             => __('Prior hair transplant / scalp treatments', 'uniquera-consultation-form'),
            'past_procedure_description'  => __('Past procedure details', 'uniquera-consultation-form'),
            'hair_loss_duration'          => __('How long dealing with hair loss', 'uniquera-consultation-form'),
            'tried_treatments'            => __('Treatments tried so far', 'uniquera-consultation-form'),
            'tried_treatments_other'      => __('Treatments tried (other)', 'uniquera-consultation-form'),
            'hair_goal'                   => __('Main goal', 'uniquera-consultation-form'),
            'transplant_timeline'         => __('When planning transplant', 'uniquera-consultation-form'),
            'referral_source'             => __('How did you get to know about us?', 'uniquera-consultation-form'),
            'referral_source_other'       => __('Referral source (other)', 'uniquera-consultation-form'),
            'additional_message'          => __('Anything else you want us to know?', 'uniquera-consultation-form'),
            'consent_info_processing'     => __('Consent: information processing', 'uniquera-consultation-form'),
            'consent_information_accuracy' => __('Consent: information accuracy', 'uniquera-consultation-form'),
            'consent_contact_channels'    => __('Consent: contact via WhatsApp/Phone/Email', 'uniquera-consultation-form'),
            'policy'                      => __('Privacy policy accepted', 'uniquera-consultation-form'),
            'policy_2'                    => __('Consent texts accepted', 'uniquera-consultation-form'),
            'visitorIP'                   => __('Visitor IP', 'uniquera-consultation-form'),
            'visitorCity'                 => __('Visitor city (geo)', 'uniquera-consultation-form'),
            'visitorCountry'              => __('Visitor country (geo)', 'uniquera-consultation-form'),
            'contact_time_country'        => __('Contact time country', 'uniquera-consultation-form'),
            'source'                      => __('Source', 'uniquera-consultation-form'),
            'type'                        => __('Type', 'uniquera-consultation-form'),
            'utm_source'                  => __('UTM source', 'uniquera-consultation-form'),
            'utm_medium'                  => __('UTM medium', 'uniquera-consultation-form'),
            'utm_campaign'                => __('UTM campaign', 'uniquera-consultation-form'),
            'utm_audience'                => __('UTM audience', 'uniquera-consultation-form'),
            'page_url'                    => __('Page URL', 'uniquera-consultation-form'),
        );
    }

    /**
     * Run before the template so body_class can see the flag (shortcode runs too late for body).
     */
    public function detect_form_on_page() {
        self::$form_on_page = self::page_includes_form();
    }

    /**
     * Favicon while viewing a page that includes the form (detected on wp; runs before wp_head).
     */
    public function output_form_favicon() {
        if (!self::$form_on_page) {
            return;
        }
        $href = UNIQUERA_CF_URL . 'assets/images/favicon.webp';
        printf(
            '<link rel="icon" href="%s" type="image/webp" sizes="any" />' . "\n",
            esc_url($href)
        );
    }

    /**
     * @param string[] $classes
     * @return string[]
     */
    public function body_class_form($classes) {
        if (self::$form_on_page) {
            $classes[] = 'uniquera-consultation-form-active';
        }
        return $classes;
    }

    /**
     * Detect shortcode/widget in post content (including Elementor JSON).
     */
    private static function page_includes_form() {
        if (!is_singular()) {
            return false;
        }
        global $post;
        if (!is_a($post, 'WP_Post')) {
            return false;
        }

        if (has_shortcode($post->post_content, 'uniquera_form') || has_shortcode($post->post_content, 'uniquera_consultation_form')) {
            return true;
        }

        $elementor = get_post_meta($post->ID, '_elementor_data', true);
        if (is_string($elementor) && $elementor !== '') {
            if (strpos($elementor, 'uniquera_consultation_form') !== false) {
                return true;
            }
            if (strpos($elementor, '[uniquera_form') !== false || strpos($elementor, '[uniquera_consultation_form') !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Ensures body gets scroll-fix class when the shortcode ran (covers Elementor edge cases).
     */
    public function footer_body_scroll_class() {
        if (!self::$form_rendered) {
            return;
        }
        echo "<script>document.body.classList.add('uniquera-consultation-form-active');</script>\n";
    }

    public function register_assets() {
        $v = UNIQUERA_CF_VERSION;
        $url = UNIQUERA_CF_URL;

        wp_register_style('uniquera-form-nouislider', $url . 'assets/css/nouislider.min.css', array(), $v);
        wp_register_style('uniquera-form-intl-tel', $url . 'assets/css/intlTelInput.css', array(), $v);
        wp_register_style('uniquera-form-main', $url . 'assets/css/main_v2.css', array(), $v);
        wp_register_style('uniquera-form-theme', $url . 'assets/css/theme-overrides.css', array('uniquera-form-main'), $v);
        wp_register_style('uniquera-form-elementor', $url . 'assets/css/uniquera-elementor-compat.css', array('uniquera-form-theme'), $v);

        wp_register_script('uniquera-nouislider', $url . 'assets/js/nouislider.min.js', array('jquery'), $v, true);
        wp_register_script('uniquera-intl-tel', $url . 'assets/js/intlTelInput.min.js', array('jquery'), $v, true);
        wp_register_script('uniquera-utils', $url . 'assets/js/utils.js', array('jquery'), $v, true);
        wp_register_script(
            'uniquera-main',
            $url . 'assets/js/uniquera-main.js',
            array('jquery', 'uniquera-nouislider', 'uniquera-intl-tel', 'uniquera-utils'),
            $v,
            true
        );
    }

    public function enqueue_assets() {
        wp_enqueue_style('uniquera-form-nouislider');
        wp_enqueue_style('uniquera-form-intl-tel');
        wp_enqueue_style('uniquera-form-main');
        wp_enqueue_style('uniquera-form-theme');
        wp_enqueue_style('uniquera-form-elementor');
        wp_enqueue_script('uniquera-main');

        $site_host = wp_parse_url(home_url(), PHP_URL_HOST);
        if (!is_string($site_host) || $site_host === '') {
            $site_host = 'uniqueraclinic.com';
        }

        wp_localize_script(
            'uniquera-main',
            'uniqueraForm',
            array(
                'ajaxUrl'          => admin_url('admin-ajax.php'),
                'nonce'            => wp_create_nonce('uniquera_form_submit'),
                'homeUrl'          => home_url('/'),
                'thankYouUrl'      => apply_filters('uniquera_cf_thankyou_url', home_url('/thank-you/')),
                'submitError'      => __('Could not submit your form. Please try again.', 'uniquera-consultation-form'),
                'trackingDefaults' => array(
                    'utm_source'   => apply_filters('uniquera_cf_default_utm_source', $site_host),
                    'utm_campaign' => apply_filters('uniquera_cf_default_utm_campaign', 'uniquera_consultation_form'),
                    'utm_audience' => apply_filters('uniquera_cf_default_utm_audience', ''),
                ),
            )
        );

        if (!self::$form_init_script_added) {
            wp_add_inline_script(
                'uniquera-main',
                'jQuery(function($){ if(typeof $.fn.onlineForm!=="function"){ return; } $(".uniquera-form-wrap .questions").onlineForm(); });',
                'after'
            );
            wp_add_inline_script(
                'uniquera-main',
                '(function(){' .
                'if(window.__uniqueraEmbedBridgeInit){return;}' .
                'window.__uniqueraEmbedBridgeInit=true;' .
                'if(window.parent===window){return;}' .
                'var lastHeight=0;' .
                'var postSize=function(){' .
                    'var root=document.querySelector(".uniquera-form-wrap,[data-uniquera-form],#onlineForm");' .
                    'var h=Math.max(' .
                        '(document.documentElement&&document.documentElement.scrollHeight)||0,' .
                        '(document.body&&document.body.scrollHeight)||0,' .
                        '(root&&root.scrollHeight)||0' .
                    ');' .
                    'if(!h){return;}' .
                    'if(Math.abs(h-lastHeight)<2){return;}' .
                    'lastHeight=h;' .
                    'try{window.parent.postMessage({type:"uniquera:embed:resize",height:h},"*");}catch(e){}' .
                '};' .
                'window.addEventListener("load",postSize);' .
                'window.addEventListener("resize",postSize);' .
                'window.addEventListener("message",function(ev){' .
                    'var data=ev&&ev.data?ev.data:null;' .
                    'if(!data||data.type!=="uniquera:embed:request-size"){return;}' .
                    'postSize();' .
                '});' .
                'setTimeout(postSize,100);' .
                'setTimeout(postSize,500);' .
                'setTimeout(postSize,1200);' .
                'if(typeof MutationObserver==="function"&&document.body){' .
                    'var mo=new MutationObserver(function(){postSize();});' .
                    'mo.observe(document.body,{childList:true,subtree:true,attributes:true,characterData:false});' .
                '}' .
                'setInterval(postSize,1500);' .
                '})();',
                'after'
            );
            self::$form_init_script_added = true;
        }
    }

    public function shortcode($atts) {
        self::$form_on_page  = true;
        self::$form_rendered = true;
        $this->enqueue_assets();

        $fragment_path = UNIQUERA_CF_PATH . 'templates/form-fragment.html';
        $tail_path     = UNIQUERA_CF_PATH . 'templates/form-tail-raw.html';

        $img_base = UNIQUERA_CF_URL . 'assets/images/';
        $html     = file_exists($fragment_path) ? file_get_contents($fragment_path) : '';
        $html     = str_replace('../assets/form/images/', $img_base, $html);
        $html     = str_replace('https://uniqueraclinic.com/', trailingslashit(home_url()), $html);

        $tail = file_exists($tail_path) ? file_get_contents($tail_path) : '';

        $uid = 'u' . wp_generate_password(8, false, false);

        return '<div class="uniquera-form-wrap" id="uniquera-form-' . esc_attr($uid) . '" data-uniquera-form="1">' . $html . $tail . '</div>';
    }

    public function ajax_save() {
        if (!check_ajax_referer('uniquera_form_submit', 'nonce', false)) {
            wp_send_json_error(array('message' => 'invalid_nonce'), 403);
        }

        if (empty($_POST) && empty($_FILES) && isset($_SERVER['REQUEST_METHOD']) && 'POST' === $_SERVER['REQUEST_METHOD']) {
            wp_send_json_error(
                array(
                    'message' => 'payload_too_large',
                    'hint'    => 'post_max_size',
                ),
                413
            );
        }

        if (function_exists('set_time_limit')) {
            @set_time_limit((int) apply_filters('uniquera_cf_ajax_time_limit', 180));
        }
        $mem = apply_filters('uniquera_cf_ajax_memory_limit', '256M');
        if (is_string($mem) && $mem !== '') {
            @ini_set('memory_limit', $mem);
        }

        global $wpdb;
        $table = $wpdb->prefix . 'uniquera_submissions';

        $data = wp_unslash($_POST);
        unset($data['action'], $data['nonce']);

        if (!empty($_FILES)) {
            $data['_uploaded_files'] = $this->collect_files_meta($_FILES);
        }

        add_filter('intermediate_image_sizes_advanced', '__return_empty_array', 999);
        add_filter('big_image_size_threshold', '__return_false', 999);

        try {
            $data['_attachment_urls'] = $this->save_uploads_to_media_library();
        } catch (Exception $e) {
            remove_filter('intermediate_image_sizes_advanced', '__return_empty_array', 999);
            remove_filter('big_image_size_threshold', '__return_false', 999);
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Uniquera CF upload: ' . $e->getMessage());
            }
            wp_send_json_error(array('message' => 'upload_failed'), 500);
        }

        remove_filter('intermediate_image_sizes_advanced', '__return_empty_array', 999);
        remove_filter('big_image_size_threshold', '__return_false', 999);

        $data = $this->enrich_submission_payload($data);
        $data = $this->strip_legacy_submission_keys($data);
        $data = $this->trim_optional_empty_fields($data);

        $full_name = isset($data['fullName']) ? sanitize_text_field($data['fullName']) : '';
        $email     = isset($data['email']) ? sanitize_email($data['email']) : '';

        $payload_for_db = $data;
        if (!empty($payload_for_db['_attachment_urls']) && is_array($payload_for_db['_attachment_urls'])) {
            foreach ($payload_for_db['_attachment_urls'] as $i => $item) {
                if (is_array($item) && isset($item['file_path'])) {
                    unset($payload_for_db['_attachment_urls'][ $i ]['file_path']);
                }
            }
        }

        $inserted = $wpdb->insert(
            $table,
            array(
                'created_at'   => current_time('mysql'),
                'full_name'    => $full_name,
                'email'        => $email,
                'payload_json' => wp_json_encode($payload_for_db),
            ),
            array('%s', '%s', '%s', '%s')
        );

        if (false === $inserted) {
            wp_send_json_error(array('message' => 'db_error'), 500);
        }

        $insert_id = (int) $wpdb->insert_id;

        $this->pending_submission_email = array(
            'data'  => $data,
            'email' => $email,
            'id'    => $insert_id,
        );
        add_action('shutdown', array($this, 'send_pending_submission_email'), 1);

        wp_send_json_success(array('id' => $insert_id));
    }

    /**
     * Public endpoint to fetch a fresh submit nonce.
     * Useful on cached pages where embedded nonce can expire.
     */
    public function ajax_nonce() {
        wp_send_json_success(
            array(
                'nonce' => wp_create_nonce('uniquera_form_submit'),
            )
        );
    }

    /**
     * Runs after the AJAX response is sent so SMTP does not block the request (avoids 503/timeouts).
     */
    public function send_pending_submission_email() {
        if (empty($this->pending_submission_email) || !is_array($this->pending_submission_email)) {
            return;
        }
        $p = $this->pending_submission_email;
        $this->pending_submission_email = null;
        if (empty($p['data']) || !isset($p['id'])) {
            return;
        }
        $this->send_submission_email($p['data'], isset($p['email']) ? $p['email'] : '', (int) $p['id']);
    }

    private function get_notification_email() {
        return sanitize_email(apply_filters('uniquera_cf_notification_email', 'uniquera@Uniqueraclinic.com'));
    }

    /**
     * Replace coded values (indices, slugs, JSON) with human-readable labels for storage and email.
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    private function enrich_submission_payload($data) {
        if (!is_array($data)) {
            return $data;
        }

        $yn = array(
            'yes' => __('Yes', 'uniquera-consultation-form'),
            'no'  => __('No', 'uniquera-consultation-form'),
        );

        $hair_grades = array(
            '0' => __('None', 'uniquera-consultation-form'),
            '1' => __('Light', 'uniquera-consultation-form'),
            '2' => __('Light-Medium', 'uniquera-consultation-form'),
            '3' => __('Medium', 'uniquera-consultation-form'),
            '4' => __('Medium-Extensive', 'uniquera-consultation-form'),
            '5' => __('Extensive', 'uniquera-consultation-form'),
        );
        foreach (array('front', 'back', 'preview') as $hk) {
            if (!isset($data[ $hk ])) {
                continue;
            }
            $gk = (string) $data[ $hk ];
            if (isset($hair_grades[ $gk ])) {
                $data[ $hk ] = $hair_grades[ $gk ];
            }
        }

        if (isset($data['color'])) {
            $color_labels = array(
                'yellow' => __('Blond', 'uniquera-consultation-form'),
                'brown'  => __('Brown', 'uniquera-consultation-form'),
                'red'    => __('Ginger', 'uniquera-consultation-form'),
                'black'  => __('Black', 'uniquera-consultation-form'),
            );
            $cv = strtolower((string) $data['color']);
            if (isset($color_labels[ $cv ])) {
                $data['color'] = $color_labels[ $cv ];
            }
        }

        if (isset($data['period'])) {
            $p = (int) $data['period'];
            $period_labels = array(
                1  => __('Less than 1 year', 'uniquera-consultation-form'),
                2  => __('1–2 years', 'uniquera-consultation-form'),
                3  => __('2–3 years', 'uniquera-consultation-form'),
                4  => __('3–4 years', 'uniquera-consultation-form'),
                5  => __('4–5 years', 'uniquera-consultation-form'),
                6  => __('5–6 years', 'uniquera-consultation-form'),
                7  => __('6–7 years', 'uniquera-consultation-form'),
                8  => __('7–8 years', 'uniquera-consultation-form'),
                9  => __('8–10 years', 'uniquera-consultation-form'),
                10 => __('More than 10 years', 'uniquera-consultation-form'),
            );
            if ($p >= 1 && $p <= 10 && isset($period_labels[ $p ])) {
                $data['period'] = $period_labels[ $p ];
            }
        }

        $this->map_payload_value($data, 'gender', array(
            'male'   => __('Man', 'uniquera-consultation-form'),
            'female' => __('Woman', 'uniquera-consultation-form'),
        ));

        $this->map_payload_value($data, 'experienced', $yn);

        $this->map_payload_value($data, 'date', array(
            'now'  => __('Immediately', 'uniquera-consultation-form'),
            '3m'   => __('Within 3 months', 'uniquera-consultation-form'),
            '12m'  => __('Within 12 months', 'uniquera-consultation-form'),
            'info' => __('Gathering information', 'uniquera-consultation-form'),
        ));

        $this->map_payload_value($data, 'speaks_english', array(
            'yes'   => __('Yes', 'uniquera-consultation-form'),
            'no'    => __('No', 'uniquera-consultation-form'),
            'other' => __('Other', 'uniquera-consultation-form'),
        ));

        $this->map_payload_value($data, 'travel_istanbul', array(
            'yes'       => __('Yes', 'uniquera-consultation-form'),
            'no'        => __('No', 'uniquera-consultation-form'),
            'not_sure'  => __('Not Sure', 'uniquera-consultation-form'),
        ));

        $this->map_payload_value($data, 'sex_gender', array(
            'male'           => __('Male', 'uniquera-consultation-form'),
            'female'         => __('Female', 'uniquera-consultation-form'),
            'nonbinary'      => __('Non-binary', 'uniquera-consultation-form'),
            'prefer_not_say' => __('Prefer not to say', 'uniquera-consultation-form'),
            'other'          => __('Other', 'uniquera-consultation-form'),
        ));

        $this->map_payload_value($data, 'prior_treatment', $yn);

        $this->map_payload_value($data, 'hair_loss_duration', array(
            'less_than_1_year'  => __('Less than 1 year', 'uniquera-consultation-form'),
            '1_to_3_years'      => __('1–3 years', 'uniquera-consultation-form'),
            '3_to_5_years'      => __('3–5 years', 'uniquera-consultation-form'),
            '5_to_10_years'     => __('5–10 years', 'uniquera-consultation-form'),
            'more_than_10_years'=> __('More than 10 years', 'uniquera-consultation-form'),
            'prefer_not_say'    => __('Prefer not to say', 'uniquera-consultation-form'),
        ));

        $tried_labels = array(
            'minoxidil'               => __('Minoxidil (topical)', 'uniquera-consultation-form'),
            'finasteride_or_similar'  => __('Finasteride / dutasteride (prescription)', 'uniquera-consultation-form'),
            'prp_or_stem'             => __('PRP / stem cell / injections', 'uniquera-consultation-form'),
            'laser_therapy'           => __('Low-level laser / devices', 'uniquera-consultation-form'),
            'hair_fibers_or_concealers' => __('Hair fibers / concealers', 'uniquera-consultation-form'),
            'nothing_yet'             => __('Nothing yet', 'uniquera-consultation-form'),
            'other'                   => __('Other', 'uniquera-consultation-form'),
        );
        if (!empty($data['tried_treatments'])) {
            if (is_array($data['tried_treatments'])) {
                $parts = array();
                foreach ($data['tried_treatments'] as $slug) {
                    $s = (string) $slug;
                    $parts[] = isset($tried_labels[ $s ]) ? $tried_labels[ $s ] : $s;
                }
                $data['tried_treatments'] = implode(
                    _x(', ', 'list separator', 'uniquera-consultation-form'),
                    $parts
                );
            } else {
                $s = (string) $data['tried_treatments'];
                $data['tried_treatments'] = isset($tried_labels[ $s ]) ? $tried_labels[ $s ] : $s;
            }
        }

        $this->map_payload_value($data, 'transplant_timeline', array(
            'asap'             => __('As soon as possible', 'uniquera-consultation-form'),
            'within_3_months'  => __('Within 3 months', 'uniquera-consultation-form'),
            'within_6_months'  => __('Within 6 months', 'uniquera-consultation-form'),
            'within_1_year'    => __('Within 1 year', 'uniquera-consultation-form'),
            'more_than_1_year' => __('More than 1 year from now', 'uniquera-consultation-form'),
            'not_sure'         => __('Not sure yet', 'uniquera-consultation-form'),
        ));

        $this->map_payload_value($data, 'referral_source', array(
            'instagram'              => __('Instagram', 'uniquera-consultation-form'),
            'facebook'               => __('Facebook', 'uniquera-consultation-form'),
            'google_search'          => __('Google / search engine', 'uniquera-consultation-form'),
            'friend_or_family'       => __('Friend or family', 'uniquera-consultation-form'),
            'other_clinic_or_doctor' => __('Another clinic or doctor', 'uniquera-consultation-form'),
            'other'                  => __('Other', 'uniquera-consultation-form'),
        ));

        foreach (array('policy', 'policy_2', 'consent_info_processing', 'consent_information_accuracy', 'consent_contact_channels') as $pk) {
            if (isset($data[ $pk ])) {
                $data[ $pk ] = ((string) $data[ $pk ] === 'accepted')
                    ? __('Accepted', 'uniquera-consultation-form')
                    : $data[ $pk ];
            }
        }

        return apply_filters('uniquera_cf_enriched_payload', $data);
    }

    /**
     * @param array<string, mixed>    $data
     * @param array<string, string>   $map
     */
    private function map_payload_value(array &$data, $key, array $map) {
        if (!isset($data[ $key ])) {
            return;
        }
        $k = (string) $data[ $key ];
        if (isset($map[ $k ])) {
            $data[ $key ] = $map[ $k ];
        }
    }

    /**
     * Legacy / duplicate fields: do not store or email (kept for backwards-compatible POST handling).
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    private function strip_legacy_submission_keys(array $data) {
        foreach (array('operation', 'contact_type', 'description') as $k) {
            unset($data[ $k ]);
        }
        return $data;
    }

    /**
     * Remove optional fields that are empty so email/DB stay lean (no blank rows).
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    private function trim_optional_empty_fields(array $data) {
        if (isset($data['additional_message']) && is_string($data['additional_message']) && trim($data['additional_message']) === '') {
            unset($data['additional_message']);
        }
        return $data;
    }

    /**
     * Move $_FILES into the Media Library and return one entry per file (permanent URLs).
     *
     * @return array<int, array{url:string, filename:string, field:string, attachment_id:int, file_path?:string}>
     */
    private function save_uploads_to_media_library() {
        $out = array();
        if (empty($_FILES) || !is_array($_FILES)) {
            return $out;
        }

        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';

        foreach ($_FILES as $field_key => $file) {
            if (!isset($file['name'])) {
                continue;
            }
            /*
             * JS sends names like files[0]_, files[1]_ — PHP uses string keys "0_", "1_", not 0,1.
             * Must foreach keys, not numeric for().
             */
            if (is_array($file['name'])) {
                foreach ($file['name'] as $sub_key => $name) {
                    if ($name === '' || $name === null) {
                        continue;
                    }
                    $single = array(
                        'name'     => $name,
                        'type'     => isset($file['type'][ $sub_key ]) ? $file['type'][ $sub_key ] : '',
                        'tmp_name' => isset($file['tmp_name'][ $sub_key ]) ? $file['tmp_name'][ $sub_key ] : '',
                        'error'    => isset($file['error'][ $sub_key ]) ? $file['error'][ $sub_key ] : 0,
                        'size'     => isset($file['size'][ $sub_key ]) ? $file['size'][ $sub_key ] : 0,
                    );
                    $label = $field_key . '[' . $sub_key . ']';
                    $saved = $this->save_one_upload_as_attachment($single, $label);
                    if ($saved) {
                        $out[] = $saved;
                    }
                }
            } else {
                if ($file['name'] === '' || $file['name'] === null) {
                    continue;
                }
                $saved = $this->save_one_upload_as_attachment($file, $field_key);
                if ($saved) {
                    $out[] = $saved;
                }
            }
        }

        return $out;
    }

    /**
     * @param array  $file  One PHP $_FILES entry.
     * @param string $field Form field name for display.
     * @return array|null
     */
    private function save_one_upload_as_attachment($file, $field) {
        if (!empty($file['error']) || empty($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            return null;
        }

        $upload_overrides = array('test_form' => false);
        $movefile         = wp_handle_upload($file, $upload_overrides);

        if (!$movefile || isset($movefile['error'])) {
            return null;
        }

        $filename = sanitize_file_name(wp_basename($file['name']));
        $title    = pathinfo($filename, PATHINFO_FILENAME);

        $attachment = array(
            'post_mime_type' => $movefile['type'],
            'post_title'     => $title ? $title : $filename,
            'post_content'   => '',
            'post_status'    => 'inherit',
        );

        $attach_id = wp_insert_attachment($attachment, $movefile['file']);

        if (is_wp_error($attach_id) || !$attach_id) {
            return null;
        }

        $meta = wp_generate_attachment_metadata($attach_id, $movefile['file']);
        if (!empty($meta)) {
            wp_update_attachment_metadata($attach_id, $meta);
        }

        $url = wp_get_attachment_url($attach_id);
        if (!$url) {
            return null;
        }

        return array(
            'url'           => $url,
            'filename'      => $filename,
            'field'         => (string) $field,
            'attachment_id' => (int) $attach_id,
            'file_path'     => (string) $movefile['file'],
        );
    }

    /**
     * @param array  $data    POST data (already unslashed)
     * @param string $reply_email
     * @param int    $submission_id
     */
    private function send_submission_email($data, $reply_email, $submission_id) {
        $to = $this->get_notification_email();
        if (empty($to)) {
            return;
        }

        $subject = sprintf(
            /* translators: %d: submission row id */
            __('[%s] New consultation form submission #%d', 'uniquera-consultation-form'),
            wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES),
            $submission_id
        );

        $body = $this->build_email_html($data, $submission_id);

        $headers = array('Content-Type: text/html; charset=UTF-8');
        if ($reply_email && is_email($reply_email)) {
            $headers[] = 'Reply-To: ' . $reply_email;
        }

        $attachments = $this->get_submission_email_attachments($data);

        $sent = wp_mail($to, $subject, $body, $headers, $attachments);
        if (!$sent && defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Uniquera CF mail send failed for submission #' . (int) $submission_id);
        }
    }

    /**
     * @param WP_Error $wp_error
     */
    public function log_mail_failure($wp_error) {
        if (!defined('WP_DEBUG') || !WP_DEBUG || !is_wp_error($wp_error)) {
            return;
        }
        $message = $wp_error->get_error_message();
        $data    = $wp_error->get_error_data();
        error_log('Uniquera CF wp_mail_failed: ' . wp_json_encode(array(
            'message' => $message,
            'data'    => $data,
        )));
    }

    /**
     * @param array<string, mixed> $mail_data
     */
    public function log_mail_success($mail_data) {
        if (!defined('WP_DEBUG') || !WP_DEBUG) {
            return;
        }
        if (is_array($mail_data) && isset($mail_data['to'])) {
            error_log('Uniquera CF wp_mail_succeeded to: ' . wp_json_encode($mail_data['to']));
        }
    }

    /**
     * @param array $data Submission payload including _attachment_urls.
     * @return string[]
     */
    private function get_submission_email_attachments($data) {
        $paths = array();
        if (empty($data['_attachment_urls']) || !is_array($data['_attachment_urls'])) {
            return $paths;
        }
        foreach ($data['_attachment_urls'] as $item) {
            if (!is_array($item)) {
                continue;
            }
            $aid = isset($item['attachment_id']) ? (int) $item['attachment_id'] : 0;
            if ($aid > 0) {
                $p = get_attached_file($aid);
                if ($p && is_readable($p)) {
                    $paths[] = $p;
                }
                continue;
            }
            if (!empty($item['file_path']) && is_readable($item['file_path'])) {
                $paths[] = $item['file_path'];
            }
        }
        return array_values(array_unique($paths));
    }

    /**
     * @param array<string, mixed> $data
     */
    private function format_submission_value_for_email($value) {
        if (is_array($value)) {
            $flat = array();
            foreach ($value as $k => $v) {
                if (is_array($v)) {
                    $flat[] = wp_json_encode($v);
                } else {
                    $flat[] = (string) $k . ': ' . (string) $v;
                }
            }
            return implode("\n", $flat);
        }
        return (string) $value;
    }

    private function build_email_html($data, $submission_id) {
        $skip_keys = array('_uploaded_files', '_attachment_urls', 'operation', 'contact_type', 'description');
        $labels    = $this->get_submission_field_labels();
        $rows      = '';
        $emitted   = array();

        foreach ($labels as $field_key => $label) {
            if (!array_key_exists($field_key, $data)) {
                continue;
            }
            $value = $data[ $field_key ];
            if ($value === '' || $value === null) {
                continue;
            }
            $emitted[ $field_key ] = true;
            $text = $this->format_submission_value_for_email($value);
            $rows .= '<tr><th style="text-align:left;padding:8px;border:1px solid #ddd;vertical-align:top;">' . esc_html($label) . '</th>';
            $rows .= '<td style="padding:8px;border:1px solid #ddd;">' . nl2br(esc_html($text)) . '</td></tr>';
        }

        foreach ($data as $key => $value) {
            if (in_array($key, $skip_keys, true) || isset($emitted[ $key ])) {
                continue;
            }
            if ($value === '' || $value === null) {
                continue;
            }
            $text = $this->format_submission_value_for_email($value);
            $rows .= '<tr><th style="text-align:left;padding:8px;border:1px solid #ddd;vertical-align:top;">' . esc_html((string) $key) . '</th>';
            $rows .= '<td style="padding:8px;border:1px solid #ddd;">' . nl2br(esc_html($text)) . '</td></tr>';
        }

        if (!empty($data['_attachment_urls']) && is_array($data['_attachment_urls'])) {
            $n = 0;
            foreach ($data['_attachment_urls'] as $item) {
                if (!is_array($item) || empty($item['url'])) {
                    continue;
                }
                ++$n;
                $url   = $item['url'];
                $fname = !empty($item['filename']) ? $item['filename'] : __('File', 'uniquera-consultation-form') . ' ' . $n;
                $link  = '<a href="' . esc_url($url) . '">' . esc_html($fname) . '</a>';
                $rows .= '<tr><th style="text-align:left;padding:8px;border:1px solid #ddd;vertical-align:top;">' . esc_html(sprintf(
                    /* translators: %d: file index */
                    __('Attachment %d', 'uniquera-consultation-form'),
                    $n
                )) . '</th>';
                $rows .= '<td style="padding:8px;border:1px solid #ddd;word-break:break-all;">' . $link . '<br/><span style="color:#555;font-size:12px;">' . esc_html($url) . '</span></td></tr>';
            }
        }

        $html  = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>';
        $html .= '<p><strong>' . esc_html__('Submission ID', 'uniquera-consultation-form') . ':</strong> ' . (int) $submission_id . '</p>';
        $html .= '<table style="border-collapse:collapse;width:100%;max-width:720px;">' . $rows . '</table>';
        $html .= '</body></html>';

        return $html;
    }

    private function collect_files_meta($files) {
        $out = array();
        foreach ($files as $key => $file) {
            if (!isset($file['name'])) {
                continue;
            }
            if (is_array($file['name'])) {
                foreach ($file['name'] as $sub_key => $name) {
                    if ($name === '' || $name === null) {
                        continue;
                    }
                    $out[] = array(
                        'field' => $key . '[' . $sub_key . ']',
                        'name'  => $name,
                        'size'  => isset($file['size'][ $sub_key ]) ? (int) $file['size'][ $sub_key ] : 0,
                        'type'  => isset($file['type'][ $sub_key ]) ? sanitize_mime_type($file['type'][ $sub_key ]) : '',
                    );
                }
            } else {
                if ($file['name'] === '' || $file['name'] === null) {
                    continue;
                }
                $out[] = array(
                    'field' => $key,
                    'name'  => $file['name'],
                    'size'  => isset($file['size']) ? (int) $file['size'] : 0,
                    'type'  => isset($file['type']) ? sanitize_mime_type($file['type']) : '',
                );
            }
        }
        return $out;
    }

    public function admin_menu() {
        add_menu_page(
            __('Uniquera', 'uniquera-consultation-form'),
            __('Uniquera', 'uniquera-consultation-form'),
            'manage_options',
            'uniquera-cf',
            array($this, 'render_admin_page'),
            'dashicons-clipboard',
            26
        );
    }

    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        global $wpdb;
        $table = $wpdb->prefix . 'uniquera_submissions';
        $rows  = $wpdb->get_results("SELECT * FROM $table ORDER BY id DESC", ARRAY_A);

        ?>
        <div class="wrap">
            <h1><?php esc_html_e('Uniquera', 'uniquera-consultation-form'); ?></h1>

            <div class="card" style="max-width:920px;margin-bottom:20px;padding:16px 20px;">
                <h2 style="margin-top:0;"><?php esc_html_e('Embed the form', 'uniquera-consultation-form'); ?></h2>
                <p><?php esc_html_e('Use this shortcode in any page, post, or in an Elementor Shortcode widget:', 'uniquera-consultation-form'); ?></p>
                <p><code style="font-size:14px;padding:6px 10px;background:#f0f0f1;display:inline-block;">[uniquera_form]</code></p>
                <p class="description"><?php esc_html_e('Alias:', 'uniquera-consultation-form'); ?> <code>[uniquera_consultation_form]</code></p>
                <p><strong><?php esc_html_e('Elementor:', 'uniquera-consultation-form'); ?></strong>
                <?php esc_html_e('Add the “Uniquera Consultation Form” widget from the widgets panel, or drop a Shortcode widget and paste the shortcode above. Full-width sections work best.', 'uniquera-consultation-form'); ?></p>
                <p class="description"><?php esc_html_e('Completed submissions are stored in the database and emailed to Uniquera@Uniqueraclinic.com.', 'uniquera-consultation-form'); ?></p>
            </div>

            <h2><?php esc_html_e('Submissions', 'uniquera-consultation-form'); ?></h2>
            <table class="widefat striped uniquera-cf-submissions"><thead>
            <tr>
                <th><?php esc_html_e('Date', 'uniquera-consultation-form'); ?></th>
                <th><?php esc_html_e('Name', 'uniquera-consultation-form'); ?></th>
                <th><?php esc_html_e('Email', 'uniquera-consultation-form'); ?></th>
                <th><?php esc_html_e('Mobile', 'uniquera-consultation-form'); ?></th>
                <th><?php esc_html_e('Files', 'uniquera-consultation-form'); ?></th>
                <th><?php esc_html_e('Action', 'uniquera-consultation-form'); ?></th>
            </tr>
            </thead><tbody>

            <?php
            foreach ($rows as $r) {
                $payload = json_decode($r['payload_json'], true);
                $phone   = is_array($payload) && isset($payload['phone']) ? $payload['phone'] : '';
                $country = is_array($payload) && isset($payload['country']) ? $payload['country'] : '';
                $contact = trim($country . ' ' . $phone);

                $file_count = 0;
                if (is_array($payload) && !empty($payload['_attachment_urls']) && is_array($payload['_attachment_urls'])) {
                    $file_count = count($payload['_attachment_urls']);
                }

                echo '<tr>
                <td>' . esc_html($r['created_at']) . '</td>
                <td>' . esc_html($r['full_name']) . '</td>
                <td>' . esc_html($r['email']) . '</td>
                <td>' . esc_html($contact) . '</td>
                <td>' . ( $file_count ? (int) $file_count : '—' ) . '</td>
                <td><button type="button" onclick="uniqueraToggleRow(' . (int) $r['id'] . ')" class="button">' . esc_html__('View', 'uniquera-consultation-form') . '</button></td>
                </tr>';

                echo '<tr id="uniquera-row-' . (int) $r['id'] . '" style="display:none;">
                <td colspan="6">
                <div style="background:#fff;padding:15px;border:1px solid #ddd;border-radius:8px;">
                <h3>' . esc_html__('Form data', 'uniquera-consultation-form') . '</h3>
                <table class="widefat striped">';

                if (is_array($payload)) {
                    $plabels = $this->get_submission_field_labels();
                    foreach ($payload as $key => $value) {
                        if ('_uploaded_files' === $key || '_attachment_urls' === $key) {
                            continue;
                        }
                        if (is_array($value)) {
                            $value = implode(', ', array_map('strval', $value));
                        }
                        $th = isset($plabels[ $key ]) ? $plabels[ $key ] : (string) $key;
                        echo '<tr>
                            <th style="width:220px;">' . esc_html($th) . '</th>
                            <td>' . esc_html((string) $value) . '</td>
                        </tr>';
                    }
                }

                if (is_array($payload) && !empty($payload['_attachment_urls']) && is_array($payload['_attachment_urls'])) {
                    $fi = 0;
                    foreach ($payload['_attachment_urls'] as $att) {
                        if (!is_array($att) || empty($att['url'])) {
                            continue;
                        }
                        ++$fi;
                        $fname = !empty($att['filename']) ? $att['filename'] : sprintf(
                            /* translators: %d: file index */
                            __('File %d', 'uniquera-consultation-form'),
                            $fi
                        );
                        $field = isset($att['field']) ? $att['field'] : '';
                        $th    = sprintf(
                            /* translators: 1: file index, 2: optional field name */
                            __('Attachment URL %1$d%2$s', 'uniquera-consultation-form'),
                            $fi,
                            $field !== '' ? ' (' . $field . ')' : ''
                        );
                        $mime = isset($att['attachment_id']) ? get_post_mime_type((int) $att['attachment_id']) : '';
                        $is_img = $mime && strpos($mime, 'image/') === 0;
                        echo '<tr>
                            <th style="width:220px;">' . esc_html($th) . '</th>
                            <td>';
                        if ($is_img) {
                            echo '<a href="' . esc_url($att['url']) . '" target="_blank" rel="noopener noreferrer"><img src="' . esc_url($att['url']) . '" alt="" style="max-width:240px;max-height:160px;height:auto;display:block;margin:0 0 10px;border-radius:6px;border:1px solid #ddd;" loading="lazy" /></a>';
                        }
                        echo '<a href="' . esc_url($att['url']) . '" target="_blank" rel="noopener noreferrer">' . esc_html($fname) . '</a><br><code style="word-break:break-all;font-size:11px;">' . esc_html($att['url']) . '</code></td>
                        </tr>';
                    }
                }

                echo '</table></div></td></tr>';
            }
            ?>

            </tbody></table>
        </div>
        <script>
        function uniqueraToggleRow(id) {
            var row = document.getElementById('uniquera-row-' + id);
            if (!row) return;
            row.style.display = (row.style.display === 'none') ? 'table-row' : 'none';
        }
        </script>
        <?php
    }

    public function register_elementor_widget($widgets_manager) {
        if (!class_exists('\Elementor\Widget_Base')) {
            return;
        }
        require_once UNIQUERA_CF_PATH . 'includes/class-elementor-form-widget.php';
        $widgets_manager->register(new Uniquera_Elementor_Form_Widget());
    }
}
<?php
/**
 * Plugin Name: Uniquera Consultation Form
 * Description: Classic multi-step hair consultation (body map, hair loss, upload) with shortcode, Elementor, DB + email.
 * Version: 1.7.8
 * Author: Uniquera
 * Text Domain: uniquera-consultation-form
 */

if (!defined('ABSPATH')) {
    exit;
}

define('UNIQUERA_CF_VERSION', '1.7.8');
define('UNIQUERA_CF_PATH', plugin_dir_path(__FILE__));
define('UNIQUERA_CF_URL', plugin_dir_url(__FILE__));

require_once UNIQUERA_CF_PATH . 'includes/class-uniquera-consultation-form.php';

Uniquera_Consultation_Form::instance();
<?php
/**
 * Elementor widget: renders the same output as the shortcode.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Uniquera_Elementor_Form_Widget extends \Elementor\Widget_Base {

    public function get_name() {
        return 'uniquera_consultation_form';
    }

    public function get_title() {
        return __('Uniquera Consultation Form', 'uniquera-consultation-form');
    }

    public function get_icon() {
        return 'eicon-form-horizontal';
    }

    public function get_categories() {
        return array('general');
    }

    public function get_keywords() {
        return array('form', 'consultation', 'uniquera', 'hair');
    }

    protected function register_controls() {
        $this->start_controls_section(
            'section_info',
            array(
                'label' => __('About', 'uniquera-consultation-form'),
                'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
            )
        );

        $this->add_control(
            'info_text',
            array(
                'type'            => \Elementor\Controls_Manager::RAW_HTML,
                'raw'             => '<p>' . esc_html__('This widget outputs the full Uniquera consultation form. Submissions are listed under Uniquera in the WordPress admin.', 'uniquera-consultation-form') . '</p>',
                'content_classes' => 'elementor-descriptor',
            )
        );

        $this->end_controls_section();
    }

    protected function render() {
        echo do_shortcode('[uniquera_form]');
    }
}

<?php
/**
 * PhpSPA Highlighter - Example File
 * 
 * This file demonstrates the syntax highlighting capabilities
 * of the PhpSPA Highlighter plugin for Acode.
 * 
 * Open this file in Acode with the plugin installed to see
 * the embedded HTML, CSS, and JavaScript properly highlighted.
 */

namespace App\Components;

class Button {
    /**
     * Render button HTML with variable interpolation
     */
    public function render($name, $id, $class = 'btn-primary') {
        return <<<HTML
            <button 
                class="btn {$class}" 
                id="{$id}" 
                onclick="handleClick('{$id}')">
                <span class="btn-icon">👋</span>
                <span class="btn-text">Hello {$name}!</span>
            </button>
        HTML;
    }
    
    /**
     * Button styles with variable interpolation
     */
    public function styles($primaryColor = '#007bff', $hoverColor = '#0056b3') {
        return <<<CSS
            .btn {
                padding: 10px 20px;
                background: {$primaryColor};
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn:hover {
                background: {$hoverColor};
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            
            .btn-icon {
                font-size: 20px;
            }
            
            .btn-text {
                font-weight: 500;
            }
        CSS;
    }
    
    /**
     * Button JavaScript with variable interpolation
     */
    public function script($buttonId) {
        return <<<JS
            function handleClick(buttonId) {
                console.log('Button clicked:', buttonId);
                
                const button = document.getElementById(buttonId);
                if (button) {
                    button.classList.add('clicked');
                    setTimeout(() => {
                        button.classList.remove('clicked');
                    }, 300);
                }
                
                alert('You clicked the button: ' + buttonId);
            }
            
            // Initialize buttons
            document.addEventListener('DOMContentLoaded', () => {
                console.log('Initializing buttons...');
                const buttons = document.querySelectorAll('.btn');
                buttons.forEach(btn => {
                    console.log('Found button:', btn.id);
                });
            });
        JS;
    }
    
    /**
     * Using JAVASCRIPT identifier (alternative to JS)
     */
    public function scriptAlt() {
        return <<<JAVASCRIPT
            const APP_CONFIG = {
                version: '1.0.0',
                debug: true,
                apiUrl: 'https://api.example.com'
            };
            
            class ButtonManager {
                constructor() {
                    this.buttons = new Map();
                }
                
                register(id, handler) {
                    this.buttons.set(id, handler);
                    console.log(`Registered button: ${id}`);
                }
                
                trigger(id) {
                    const handler = this.buttons.get(id);
                    if (handler) {
                        handler();
                    }
                }
            }
        JAVASCRIPT;
    }
}

class Modal {
    /**
     * Nowdoc example - NO variable interpolation
     * Variables like {$var} will be treated as literal text
     */
    public function templateStatic() {
        return <<<'HTML'
            <div class="modal">
                <div class="modal-header">
                    <h2>Static Template</h2>
                    <p>This {$variable} will not be interpolated</p>
                </div>
                <div class="modal-body">
                    <p>Nowdoc syntax uses quotes: <<<'HTML'</p>
                </div>
            </div>
        HTML;
    }
    
    /**
     * Nowdoc CSS example
     */
    public function stylesStatic() {
        return <<<'CSS'
            .modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }
            
            .modal-header {
                border-bottom: 1px solid #eee;
                padding-bottom: 10px;
            }
        CSS;
    }
    
    /**
     * Nowdoc JavaScript example
     */
    public function scriptStatic() {
        return <<<'JS'
            function showModal(content) {
                const modal = document.createElement('div');
                modal.className = 'modal';
                modal.innerHTML = content;
                document.body.appendChild(modal);
            }
            
            function hideModal() {
                const modal = document.querySelector('.modal');
                if (modal) {
                    modal.remove();
                }
            }
        JS;
    }
}

/**
 * Indented heredoc example (PHP 7.3+)
 */
class Card {
    public function render($title, $content) {
        return <<<HTML
            <div class="card">
                <div class="card-header">
                    <h3>{$title}</h3>
                </div>
                <div class="card-body">
                    {$content}
                </div>
            </div>
        HTML;
    }
}

// Example usage
$button = new Button();
echo $button->render('World', 'btn-1', 'btn-primary');
echo $button->styles('#007bff', '#0056b3');
echo $button->script('btn-1');

$modal = new Modal();
echo $modal->templateStatic();
echo $modal->stylesStatic();

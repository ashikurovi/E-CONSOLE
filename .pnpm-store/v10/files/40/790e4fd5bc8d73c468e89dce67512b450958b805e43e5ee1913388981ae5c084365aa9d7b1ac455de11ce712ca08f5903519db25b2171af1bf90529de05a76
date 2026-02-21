'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');
var uuid = require('uuid/v4');

var TinyMCE = function (_React$Component) {
    _inherits(TinyMCE, _React$Component);

    function TinyMCE(props) {
        _classCallCheck(this, TinyMCE);

        var _this = _possibleConstructorReturn(this, (TinyMCE.__proto__ || Object.getPrototypeOf(TinyMCE)).call(this, props));

        _this.initialiseEditor = _this.initialiseEditor.bind(_this);
        _this.removeEditor = _this.removeEditor.bind(_this);

        _this.id = props.id || uuid();

        _this.state = {
            editor: null
        };
        return _this;
    }

    _createClass(TinyMCE, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (typeof window === "undefined" || typeof document === "undefined") return;

            if (window.tinymce || window._has_requested_tinymce) {
                this.initialiseEditor();
                return;
            }

            this.script = document.createElement('script');
            this.script.type = "application/javascript";
            this.script.addEventListener('load', this.initialiseEditor);
            this.script.src = 'https://cloud.tinymce.com/stable/tinymce.min.js' + (this.props.apiKey ? '?apiKey=' + this.props.apiKey : '');
            document.head.appendChild(this.script);

            window._has_requested_tinymce = true;
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (typeof this.script !== "undefined") {
                this.script.removeEventListener('load', this.initialiseEditor);
            }

            if (this.state.editor) {
                this.removeEditor();
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(next_props) {
            if (!this.state.editor) {
                this.initialiseEditor();
            } else if (this.props.content !== next_props.content) {
                this.state.editor.setContent(next_props.content);
            }
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate() {
            return false;
        }
    }, {
        key: 'initialiseEditor',
        value: function initialiseEditor() {
            var _this2 = this;

            if (typeof window === "undefined") return;

            if (window._has_requested_tinymce && !window.tinymce && !this.state.editor) {
                // Multiple editors on the page, one of the other ones has already requested the tinymce script
                setTimeout(function () {
                    try {
                        _this2.initialiseEditor();
                    } catch (e) {}
                }, 500);
                return;
            }

            if (this.state.editor) {
                this.removeEditor();
            }

            var component = this;

            var config = this.props.config;
            config.selector = '#' + component.id;
            config.setup = function (editor) {
                component.setState({ editor: editor });

                editor.on('init', function () {
                    editor.setContent(component.props.content);
                });

                editor.on('keyup change', function () {
                    var content = editor.getContent();
                    component.props.onContentChanged(content);
                });
            };

            window.tinymce.init(config);
        }
    }, {
        key: 'removeEditor',
        value: function removeEditor() {
            window.tinymce.remove(this.state.editor);
            this.setState({
                editor: null
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                content = _props.content,
                config = _props.config,
                className = _props.className;


            if (config.inline) {
                return React.createElement('div', { id: this.id, className: className, dangerouslySetInnerHTML: { __html: content } });
            } else {
                return React.createElement('textarea', { id: this.id, style: { visibility: 'hidden' }, defaultValue: content });
            }
        }
    }]);

    return TinyMCE;
}(React.Component);

TinyMCE.defaultProps = {
    id: undefined,
    content: '',
    config: { height: 300 },
    onContentChanged: function onContentChanged() {}
};

module.exports = TinyMCE;
/**************************************************************
    AngularJS - Dialogs
**************************************************************/

(function (angular) {
    'use strict';

    if(!jQuery){
        var Lite = function (selector) {
                if (selector[0] == '.')
                    this.element = document.getElementsByClassName(selector.replace('.', ''));
                else if (selector[0] == '#')
                    this.element = [document.getElementById(selector.replace('#', ''))];
                else
                    this.element = document.getElementsByTagName(selector);

                this.length = this.element.length;
            },
            $el = function (selector) {
                return new Lite(selector);
            };


        Lite.prototype = {
            events: [],

            get: function (index) {
                return this.element[index];
            },

            prepend: function (elem) {
                var self = this;

                this.each(function (i) {
                    var elemHtml = self.parseHTML(elem),
                        el = self.element[i];

                    el.insertBefore(elemHtml, el.childNodes[0]);
                });

                return this;
            },

            append: function (elem) {
                var self = this;

                this.each(function (i) {
                    var elemHtml = self.parseHTML(elem),
                        el = self.element[i];

                    el.appendChild(elemHtml);
                });

                return this;
            },

            addClass: function (value) {
                var self = this;

                this.each(function (i) {
                    var current = self.element[i].getAttribute('class').trim().split(' ');

                    current.push(value)

                    self.element[i].setAttribute('class', current.join(' '));
                });

                return this;
            },

            removeClass: function (value) {
                var self = this;

                this.each(function (i) {
                    var current = self.element[i].getAttribute('class').trim().split(' ');

                    var index = current.indexOf(value);

                    if (index != -1) {
                        current.splice(index, 1);

                        self.element[i].setAttribute('class', current.join(' '));
                    }
                });

                return this;
            },

            on: function (event, fn) {
                var self = this;

                if (typeof fn == 'function')
                    this.each(function (i) {
                        self.element[i].addEventListener(event, fn, false);
                    });
                else
                    console.error('Expression is not a function.');

                return this;
            },

            parseHTML: function (elem) {
                var parser = new DOMParser(),
                    htmlDoc = parser.parseFromString(elem, "text/html"),
                    body = htmlDoc.getElementsByTagName('body')[0];

                return body.childNodes[0];
            },

            each: function (expression) {
                if (typeof expression == 'function') {
                    for (var i = 0; i < this.element.length; i++)
                        expression(i, this.element[i]);
                }
                else
                    console.error('Expression is not a function.');
            }
        }
    }

    var logs = [],
        App = angular.module('Dialog', []);

    App
        .service('Dialog', ['$q', '$injector', function ($q, $injector) {
            var Dialog = function () {
                var _this = this;

                _this.alert = function (title, message, params) {
                    if (params == undefined)
                        params = {};

                    var defer = $q.defer(),
                        dialogFunc = new DialogFunc(defer);

                    params.title = title;
                    params.message = message;

                    if (params.submitText == undefined)
                        params.submitText = 'OK';

                    dialogFunc.compile('<alert' + dialogFunc.setAttributes(params) + '></alert>', $injector);

                    return defer.promise;
                };

                _this.confirm = function (title, message, params) {
                    if (params == undefined)
                        params = {};

                    var defer = $q.defer(),
                        dialogFunc = new DialogFunc(defer);

                    params.title = title;
                    params.message = message;

                    if (params.submitText == undefined)
                        params.submitText = 'Sim';

                    if (params.cancelText == undefined)
                        params.cancelText = 'Não';

                    dialogFunc.compile('<confirm' + dialogFunc.setAttributes(params) + '></confirm>', $injector);

                    return defer.promise;
                };
            };

            return new Dialog();
        }]);

    //  Filters
    App
        .filter('trustAsHtml', ['$sce', function ($sce) {
            return function (text) {
                return $sce.trustAsHtml(text);
            };
        }]);

    //  General dialog functions
    var DialogFunc = function (defer) {
        //  Constantes
        var CSS_CALLBACK_EVENTS = 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd',
            ZINDEX_DEFAULT_VALUE = 11000;

        return {
            show: function (e) {
                if ($el('.modal-backdrop').length == 0)
                    $el('body').append('<div id="backdrop-' + e[0].id + '" class="modal-backdrop fade"></div>');

                //  Add class with the effect to dialog's visualization
                setTimeout(function () {
                    e.addClass('in');

                    $el('.modal-backdrop').addClass('in');
                }, 30);
            },

            hide: function (e) {
                var dialogId = e[0].id,
                    $backdrop = $el('#backdrop-' + dialogId);

                if ($backdrop.length > 0)
                    $backdrop.removeClass('in').on(CSS_CALLBACK_EVENTS, function () {
                        $backdrop.remove();
                    });

                e.removeClass('in').on(CSS_CALLBACK_EVENTS, function () {
                    e.remove();

                    new Logs().remove(dialogId);
                });
            },

            submit: function (e) {
                var dialogId = e[0].id,
                    $backdrop = $el('#backdrop-' + dialogId);

                if ($backdrop.length > 0)
                    $backdrop.removeClass('in').on(CSS_CALLBACK_EVENTS, function () {
                        $backdrop.remove();
                    });

                e.removeClass('in').on(CSS_CALLBACK_EVENTS, function () {
                    e.remove();

                    new Logs().remove(dialogId);

                    defer.resolve();
                });
            },

            getProperties: function (dialog) {
                return JSON.parse(decodeURIComponent(dialog));
            },

            compile: function (elementStr, $injector) {
                var dialogId = this.newId(),
                    logs = new Logs(),
                    zIndex = logs.size() + ZINDEX_DEFAULT_VALUE;

                elementStr = elementStr
                                .replace('id', 'id="' + dialogId + '"')
                                .replace('zIndex', 'style="z-index:' + zIndex + ';"');
                
                $el('body').prepend(elementStr);

                var element = $el('#' + dialogId);

                $injector.invoke(function ($rootScope, $compile) {
                    //  Add the "defer" in $rootScope according to dialog's id
                    $rootScope[dialogId] = { defer: defer };
                    
                    $compile(element.get(0))($rootScope);

                    logs.set(dialogId);
                });

                return dialogId;
            },

            newId: function () {
                var text = "",
                    possibles = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i = 0; i < 15; i++)
                    text += possibles.charAt(Math.floor(Math.random() * possibles.length));

                return text;
            },

            setAttributes: function (attrs) {
                return ' id zIndex dialog="' + encodeURIComponent(JSON.stringify(attrs)) + '"';
            }
        }

    };

    //  Logs
    var Logs = function () {
        return {
            set: function (id) {
                logs.push(id);
            },
            size: function () {
                return logs.length;
            },
            remove: function (id) {
                var temp = [];

                for (var i = 0; i < logs.length; i++)
                    if (logs[i] != id)
                        temp.push(logs[i]);

                logs = temp;
            }
        }
    };

    //  Directives
    App
        .directive('alert', ['$compile', '$rootScope', function ($compile, $rootScope) {
            return {
                restrict: 'E',
                templateUrl: '/angular-dialogs/templates/alert.html',
                replace: true,
                scope: { dialog: '@' },
                link: function (scope, e, attrs) {
                    var dialogId = e[0].id,
                        dialog = new DialogFunc($rootScope[dialogId].defer);

                    delete ($rootScope[dialogId]);

                    dialog.show(e);

                    scope.$watch('dialog', function () {
                        if (typeof scope.dialog == 'string') {
                            scope.dialog = dialog.getProperties(scope.dialog);

                            $compile(e)(scope);
                        }
                    });

                    //  Events area
                    scope.submit = function () {
                        dialog.submit(e);
                    };
                }
            };
        }])
        .directive('confirm', ['$compile', '$rootScope', '$sce', function ($compile, $rootScope, $sce) {
            return {
                restrict: 'E',
                templateUrl: '/assets/plugins/dialogs/templates/confirm.html',
                replace: true,
                scope: { dialog: '@' },
                link: function (scope, e, attrs) {
                    var dialogId = e[0].id,
                        dialog = new DialogFunc($rootScope[dialogId].defer);

                    delete ($rootScope[dialogId]);

                    dialog.show(e);

                    scope.$watch('dialog', function () {
                        if (typeof scope.dialog == 'string') {
                            scope.dialog = dialog.getProperties(scope.dialog);

                            scope.message = $sce.trustAsHtml(scope.message);

                            $compile(e)(scope);
                        }
                    });

                    //  Events area
                    scope.submit = function () {
                        dialog.submit(e);
                    };

                    scope.hide = function () {
                        dialog.hide(e);
                    };
                }
            };
        }]);



})(angular);

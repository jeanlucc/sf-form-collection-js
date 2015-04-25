$(function () {

    var CollectionManager = function (collectionContainer, options) {
        this.$collectionContainer = $(collectionContainer);

        this.init(collectionContainer, options);
    }

    CollectionManager.VALID_INSERT_METHOD = ['append', 'prepend', 'after', 'before'];

    CollectionManager.prototype = {
        init: function (collectionContainer, options) {
            this.options = this.getOptions(options);
            this.$collectionHolder = this.$collectionContainer.find(this.options['collection-holder-selector']);
            this.itemPrototype = this.$collectionHolder.data(this.options['prototype-name']);
            this.indexPattern = new RegExp(this.options['index-placeholder'], 'g');
            this.index = this.$collectionHolder.children().length;

            if ('string' === typeof this.options['add-button-selector']) {
                this.$collectionContainer.on('click', this.options['add-button-selector'], function(event) {
                    this.addItemHandleEvent(event);
                }.bind(this))
            }

            if ('string' === typeof this.options['delete-button-selector']) {
                this.$collectionContainer.on('click', this.options['delete-button-selector'], function(event) {
                    this.deleteItemHandleEvent(event);
                }.bind(this))
            }
        },

        addItemHandleEvent: function(event) {
            event.preventDefault();

            this.addItem(null, null, null, event);
        },

        addItem: function(method, itemToAdd, referenceItem, event) {
            method = method ? method : this.options['insert-method'];
            var $itemToAdd = $(itemToAdd ? itemToAdd : this.createItem());
            var $referenceItem = referenceItem ? $(referenceItem) : this.getClickedItem(event);

            var beforeAddEvent = $.Event(this.options['before-add-event-name']);
            beforeAddEvent.method = method;
            beforeAddEvent.itemToAdd = $itemToAdd;
            beforeAddEvent.referenceItem = $referenceItem;
            beforeAddEvent.clickEvent = event;

            this.$collectionContainer.trigger(beforeAddEvent);
            if (beforeAddEvent.isDefaultPrevented()) {
                return;
            }

            var $itemToAdd = $(beforeAddEvent.itemToAdd);

            switch (beforeAddEvent.method) {
            case 'append':
                this.append($itemToAdd);
                break;
            case 'prepend':
                this.prepend($itemToAdd);
                break;
            case 'after':
                var $referenceItem = $(beforeAddEvent.referenceItem ? beforeAddEvent.referenceItem : this.getClickedItem(event));
                this.after($referenceItem, $itemToAdd);
                break;
            case 'before':
                var $referenceItem = $(beforeAddEvent.referenceItem ? beforeAddEvent.referenceItem : this.getClickedItem(event));
                this.before($referenceItem, $itemToAdd);
                break;
            default:
                console.error(this.options['insert-method'] + ' is not a valid insert-method. Valid insert-method are: ' + CollectionManager.VALID_INSERT_METHOD.join(', '));
            }

            var afterAddEvent = $.Event(this.options['after-add-event-name']);
            afterAddEvent.addedItem = $itemToAdd;
            afterAddEvent.clickEvent = event;

            this.$collectionContainer.trigger(afterAddEvent);
        },

        append: function(itemToAdd) {
            this.$collectionHolder.append(itemToAdd ? itemToAdd : this.createItem());
        },

        prepend: function(itemToAdd) {
            this.$collectionHolder.prepend(itemToAdd ? itemToAdd : this.createItem());
        },

        after: function(referenceItem, itemToAdd) {
            $(referenceItem).after(itemToAdd ? itemToAdd : this.createItem());
        },

        before: function(referenceItem, itemToAdd) {
            $(referenceItem).before(itemToAdd ? itemToAdd : this.createItem());
        },

        createItem: function() {
            var newItem = this.itemPrototype.replace(this.indexPattern, this.index);
            this.index = this.index + 1;

            return newItem;
        },

        deleteItemHandleEvent: function (event) {
            event.preventDefault();

            this.deleteItem(null, event);
        },

        deleteItem: function(itemToDelete, event) {
            var $itemToDelete = $(itemToDelete ? itemToDelete : this.getClickedItem(event));
            var beforeDeleteEvent = $.Event(this.options['before-delete-event-name']);
            beforeDeleteEvent.itemToDelete = $itemToDelete;
            beforeDeleteEvent.clickEvent = event;

            this.$collectionContainer.trigger(beforeDeleteEvent);
            if (beforeDeleteEvent.isDefaultPrevented()) {
                return;
            }

            $itemToDelete = $(beforeDeleteEvent.itemToDelete);
            $itemToDelete.remove();

            var afterDeleteEvent = $.Event(this.options['after-delete-event-name']);
            afterDeleteEvent.deletedItem = $itemToDelete;
            afterDeleteEvent.clickEvent = event;

            this.$collectionContainer.trigger(afterDeleteEvent);
        },

        getClickedItem: function(event) {
            if (undefined === event) {
                return;
            }
            var clickedElement = event.target;
            var collectionContainer = this.$collectionContainer[0];
            if ($.contains(collectionContainer, clickedElement)) {
                return $(clickedElement).closest(this.options['item-closest-selector'], collectionContainer)
            }
        },

        getOptions: function (customOptions) {
            if ('undefined' !== typeof this.options) {
                return this.options;
            }

            if ('undefined' === typeof customOptions) {
                customOptions = {};
            }

            customOptions = $.extend(this.getDataOptions(), customOptions);

            var options = {};
            $.extend(options, this.getDefaultOptions());
            $.extend(options, this.getNamedOptions('name' in customOptions ? customOptions['name'] : ''));
            if ('event-name' in customOptions && customOptions['event-name'].length > 0) {
                options['event-name'] = customOptions['event-name'] + '.';
            }
            $.extend(options, this.getEventOptions(options['event-name']));
            $.extend(options, customOptions);

            this.validateOptions(options);

            return options;
        },

        getDefaultOptions: function() {
            return {
                'insert-method': 'append',
            };
        },

        getNamedOptions: function(name) {
            if (name.length === 0) {
                return {
                    'prototype-name': 'prototype',
                    'index-placeholder': '__name__',
                    'item-closest-selector': '.item',
                    'collection-holder-selector': '.collection_holder',
                    'add-button-selector': '.add_item',
                    'delete-button-selector': '.delete_item',
                    'event-name': '',
                };
            }

            return {
                'prototype-name': name + '-prototype',
                'index-placeholder': '__' + name + '_name__',
                'item-closest-selector': '.' + name + '_item',
                'collection-holder-selector': '.' + name + '_collection_holder',
                'add-button-selector': '.add_' + name + '_item',
                'delete-button-selector': '.delete_' + name + '_item',
                'event-name': name + '.',
            };
        },

        getEventOptions: function(eventName) {
            return {
                'before-add-event-name': eventName + 'before-add',
                'after-add-event-name': eventName + 'after-add',
                'before-delete-event-name': eventName + 'before-delete',
                'after-delete-event-name': eventName + 'after-delete',
            };
        },

        getDataOptions: function() {
            var dataOptionNames = [
                'name',
                'insert-method',
                'prototype-name',
                'index-placeholder',
                'item-closest-selector',
                'collection-holder-selector',
                'add-button-selector',
                'delete-button-selector',
                'event-name',
                'before-add-event-name',
                'after-add-event-name',
                'before-delete-event-name',
                'after-delete-event-name',
            ];

            var dataOptions = {};
            dataOptionNames.forEach(function(optionName) {
                var dataOption = this.$collectionContainer.data(optionName);
                if ('undefined' !== typeof dataOption) {
                    dataOptions[optionName] = dataOption;
                }
            }.bind(this));

            return dataOptions;
        },

        validateOptions: function(options) {
            if ($.inArray(options['insert-method'], CollectionManager.VALID_INSERT_METHOD) === -1) {
                console.error(options['insert-method'] + ' is not a valid insert-method. Valid methods are: ' + CollectionManager.VALID_INSERT_METHOD.join(', '));
            }
        },

        getHolder: function() {
            return this.$collectionHolder;
        },
    };

    $.fn.manageCollection = function (options) {
        return this.map(function (index, collectionContainer) {
            return new CollectionManager(collectionContainer, options);
        })
    };

    $(document).ready(function () {
        $('.collection_container').manageCollection();
    });
});

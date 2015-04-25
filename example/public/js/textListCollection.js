$(function () {
    var TEXT = window.TEXT || {};
    window.TEXT = TEXT;

    TEXT.TextListCollection = function (collectionContainer) {
        this.$collectionContainer = $(collectionContainer);
        this.$navTabContainer = this.$collectionContainer.find('.nav-tabs');
        this.$tabContentContainer = this.$collectionContainer.find('.tab-content');

        this.init();
    }

    TEXT.TextListCollection.prototype = {
        init: function (collectionContainer, options) {
            this.collectionManager = this.$collectionContainer.manageCollection({
                'name': 'textlist',
                'index-placeholder': '__parent_name__',
                'item-closest-selector': 'li',
            })[0];

            this.$collectionContainer.on('textlist.after-add', function(event) {
                this.afterAdd(event);
            }.bind(this));

            this.$collectionContainer.on('textlist.before-delete', function(event) {
                this.beforeDelete(event);
            }.bind(this));

            this.$collectionContainer.on('textlist.after-delete', function(event) {
                this.afterDelete(event);
            }.bind(this));

            this.$navTabContainer.on('click', 'a', function(event) {
                event.preventDefault();
                $(event.target).tab('show');
            });

            if (this.collectionManager.getHolder().children().length === 0) {
                this.collectionManager.addItem();
            }
        },

        afterAdd: function(event) {
            var $addedItem = $(event.addedItem);
            var $navTab = $addedItem.first();
            var $textCollectionContainer = $addedItem.last();

            $navTab.remove();
            this.$navTabContainer.append($navTab);

            $textCollectionContainer.data('text-collection-manager', new TEXT.TextCollection($textCollectionContainer));

            $navTab.find('a').trigger('click');
        },

        beforeDelete: function(event) {
            if (this.$navTabContainer.children().length === 1) {
                event.preventDefault();
                return;
            }

            if (!confirm('Do you really want to delete this list?')) {
                event.preventDefault();
                return;
            }

            var $navTab = $(event.itemToDelete);
            var $textCollectionContainer = this.$tabContentContainer.find($navTab.find('a').attr('href'));

            textCollectionManager = $textCollectionContainer.data('text-collection-manager').collectionManager;
            textCollectionManager.getHolder().children().each(function(index, item) {
                textCollectionManager.deleteItem($(item));
            });

            $textCollectionContainer.remove();
        },

        afterDelete: function(event) {
            this.$navTabContainer.children().first().find('a').trigger('click');
        },
    };

    var $collectionContainer = $('.textlist_collection_container');
    if ($collectionContainer.length > 0) {
        new TEXT.TextListCollection($collectionContainer);
    }
});

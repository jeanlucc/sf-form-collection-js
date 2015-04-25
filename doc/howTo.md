# How it works

I'll assume you are familiar with form collection.

You will need:
- a container: top html block with all elements which interact with the collection;
- a collection holder: direct parent of the items of your collection;
- a prototype: necessary html to create a new item;
- a placeholder: pattern in the prototype to replace with a unique id at item creation;
- a button to add an item;
- a button to delete an item.

## Simple case

I will explain the details of how
[simple.html](../example/view/simple.html) works.
- The container has the class `collection_container`.
`collection.js` automatically initiate a `CollectionManager` on element with this class.
- The collection holder has the class `collection_holder`.
- The prototype is stored in `data-prototype` of the collection holder
  (default in symfony).
- The placeholder is `__name__` (default in symfony).
- The delete buttons have the class `delete_item` and the add button
  has the class `add_item`.
- The items have the class `item`.

The index used to replace the placeholder is intern to the
`CollectionManager` and initialized with the children count of the
holder.  By default new elements are appended to the collection
holder.

I guess that's enough for default cases.

## Basic customization

For some reason you might want to change some parameters.  In order to
do so, you have two choices.  Either create the `CollectionManager`
manually and provide an option object as argument.  or use data on
your container.

### Use data on the container

```
<div class="collection_container" data-option-name="option-value">
...
</div>
```

### Create CollectionManager manually

Assuming `$collectionContainer` is the jQuery object associated to
your container:

```
$collectionContainer.manageCollection({'option-name': 'option-value'});
```

If you use both customizations, the data customization will be
overridden by the one of the creation.

## Basic options

- `insert-method`: can be `append` (default), `prepend`, `before` or `after`.
[Append](http://api.jquery.com/append/) and
[preprend](http://api.jquery.com/prepend/) uses jQuery to add the new
item in the collection holder. [Before](http://api.jquery.com/before/)
and [after](http://api.jquery.com/after/) uses jQuery to add the new
item next to the chose item.  In order to use one of those two method,
each item must contain its own add button.
- `prototype-name`: default `prototype`.
The name of the data attached to the collection holder which contains the prototype.
- `index-placeholder`: default `__name__`.
The placeholder of the item index in the prototype. It must not
contain regexp special characters.
- `item-closest-selector`: default `.item`.
The selector used to find the item from the click event target of
delete.  The same selector is used to add an item with the `before` or
`after` insert method.
- `collection-holder-selector`: default `.collection_holder`.
The selector used to find the collection holder in the container.
- `add-button-selector`: default `.add_item`.
The selector used to find the add button(s) in the container.
- `delete-button-selector`: default `.delete_item`.
The selector used to find the delete buttons in the container.
- `name`: aims to give an easy way to customize almost all other options.

`name` effect:

| option                       | `name` undefined     | `name` = 'tag'           |
|------------------------------|----------------------|--------------------------|
| `prototype-name`             | `prototype`          | `tag-prototype`          |
| `index-placeholder`          | `__name__`           | `__tag_name__`           |
| `item-closest-selector`      | `.item`              | `.tag_item`              |
| `collection-holder-selector` | `.collection_holder` | `.tag_collection_holder` |
| `add-button-selector`        | `.add_item`          | `.add_tag_item`          |
| `delete-button-selector`     | `.delete_item`       | `.delete_tag_item`       |

If you provide a `name` and an option changed by `name`, the provided
option override the option modified by `name`.

All `selector` options can be any
[selector](https://api.jquery.com/category/selectors/) valid in
jQuery.

## Access the CollectionManager

When you manage a collection manually, the created `CollectionManager`
is returned (in an array) and you can access it.

```
var collectionManager = $collectionContainer.manageCollection()[0];
```

Get the manager allows you to use its methods.
- `getHolder`: returns the collection holder.

        var $collectionHolder = $(collectionManager.getHolder());
- `append`: append a new item to the holder. You can optionnaly provide the jQuery object you want to append.

        collectionManager.append();
or

        var $item = $('create your item');
        collectionManager.append($item);
- `prepend`: same as append but use prepend.
- `before`: add an item before the provided element. You can optionnaly provide the jQuery object you want to append.

        var $elementBeforeWhichItemWillBeAdded = $('create here');
        collectionManager.before($elementBeforeWhichItemWillBeAdded)
or

        var $elementBeforeWhichItemWillBeAdded = $('create here');
        var $item = $('create your item');
        collectionManager.before($elementBeforeWhichItemWillBeAdded, $item);
- `after`: same as before but use after.
- `deleteItem`: delete the provided item.

        var $itemToDelete = $collectionHolder.find('item to delete');
        collectionManager.deleteItem($itemToDelete);
- `addItem`: add an item. This method takes three optional arguments.
For each argument, if you provide `null`, the default option will be used.
  - The method can be any value of the `insert-method` option, it is used to override the option chose at `CollectionManager` creation.
  - The item to add.
  - The reference item used only if method is `before` or `after`.

  Examples:
  - Add an item with the default method (`append` or `prepend`)

          collectionManager.addItem();
  - Add the given item using the default method (`append` or `preprend`)

          var $item = $('create your item');
          collectionManager.addItem(null, $item);
  - Add an item relatively to another using default method (`before` or `after`)

          var $referenceItem = $('create here');
          collectionManager.addItem(null, null, $referenceItem);
  - Add the given item relatively to another using default method (`before` or `after`)

          var $item = $('create your item');
          var $referenceItem = $('create here');
          collectionManager.addItem(null, $item, $referenceItem);
  - Append an item

          collectionManager.addItem('append');
  - Put an item after another

          var $referenceItem = $('create here');
          collectionManager.addItem('after', null, $referenceItem);

The difference between addItem and the four specialized method
(`append`, `preprend`, `before`, `after`) is that `addItem` like
`deleteItem` fire events and the other four do not. If you do not wish
to fire events on delete, you just need to use
[remove](https://api.jquery.com/remove/) yourself.

## Use events

You must wonder how you can add your custom javascript behaviors such as:
- keep at least one (empty) item in the collection;
- add javascript behavior to the created elements
(e.g. a datepicker on an input, or create a nested collection);
- disable add if there are "invalid" items;
- duplicate an item instead of creating a new one;
- store deleted elements somewhere else in the DOM.

You will have to use the events.

### Customize event names

- `before-add-event-name`: default `before-add`, the name of the event triggered on
container before an item is added;
- `after-add-event-name`: default `after-add`, the name of the event triggered on
container after an item is added;
- `before-delete-event-name`: default `before-delete`, the name of the event triggered on
container before an item is deleted;
- `after-delete-event-name`: default `after-delete`, the name of the event triggered on
container after an item is deleted.


The events name are also affected by the `name` option. Alternatively
you can use `event-name` which overrides `name` and affect the event
names in the same way.

`name` effect:

| option                     | `name` and `event-name` undefined | `name` or `event-name` = 'tag' |
|----------------------------|-----------------------------------|--------------------------------|
| `before-add-event-name`    | `before-add`                      | `tag.before-add`               |
| `after-add-event-name`     | `after-add`                       | `tag.after-add`                |
| `before-delete-event-name` | `before-delete`                   | `tag.before-delete`            |
| `after-delete-event-name`  | `after-delete`                    | `tag.after-delete`             |

### Register to an event

```
$collectionContainer.on('event-name', function(event) {
    ...
});
```


### Before add

If you do not want to add an item, use `preventDefault` on the event:

```
beforeAddEvent.preventDefault();
```

The event has some arguments that you can use to customize the behavior.
- `itemToAdd`: the item that will be added;
- `method`: the method that will be used to add the item;
- `referenceItem`: the reference item or undefined if the clicked
button is not inside an item.

```
var $icon = $('my beautifull icon');
var $item = $(beforeAddEvent.itemToAdd);
$item.append($icon);
beforeAddEvent.itemToAdd = $item;

beforeAddEvent.method = 'after';

beforeAddEvent.referenceItem = $(beforeAddEvent.referenceItem).siblings().first();
```

### After add

You have access to the added item in `addedItem`.

```
var $icon = $('my beautifull icon');
$(afterAddEvent.addedItem).prepend($icon);
```

### Before delete

If you do not want to remove an item, use `preventDefault` on the event:

```
beforeDeleteEvent.preventDefault();
```

The event has the item that will be deleted in `itemToDelete` and you
can modify it.

```
beforeDeleteEvent.itemToDelete = $(beforeDeleteEvent.itemToDelete).next();
```

### After delete

You have access to the deleted item in `deletedItem`.

```
$('body').append(afterDeleteEvent.deletedItem);
```

### Common argument

If you do not call `addItem` or `deleteItem` yourself, you also have access to the
original click event in `clickEvent` in the four events.

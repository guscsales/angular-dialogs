# Angular Dialogs
Simple plugin for dialogs using AngularJS

## Requires
- [AngularJS](https://angularjs.org/)

## Download

```bash
git clone https://github.com/hebsix/angular-dialogs.git
```

## Usage

### Alerts
```javascript
angular.module('myapp', ['Dialog']).controller(Dialog, function(){
    Dialog.alert('Title Here', 'Your message of alert');
});
```

```javascript
angular.module('myapp', ['Dialog']).controller(Dialog, function(){
    Dialog.alert('Title Here', 'Your message of alert', {
        submitText: 'You can put a message on button'
    });
});
```

```javascript
angular.module('myapp', ['Dialog']).controller(Dialog, function(){
    Dialog.alert('Title Here', 'Your message of alert').then(function(){
        //  Your callback after click :)
    });;
});
```

### Confirms
```javascript
angular.module('myapp', ['Dialog']).controller(Dialog, function(){
    Dialog.confirm('Title Here', 'Your message of confirm').then(function(){
        //  Your callback for yes :)
    });
});
```



## About
- Author: Gustavo Sales (http://github.com/hebsix)


## Contact
- Skype: guustavosales
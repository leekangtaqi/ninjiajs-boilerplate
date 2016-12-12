const mask = (mask = true, action) => {
    switch (action.type){
        case 'maskShow':
            mask = true;
            return mask;
        case 'maskHidden':
            mask = false;
            return mask;
        default:
            return mask;
    }
};

const title = (title = '91拼团', action) => {
    if(action.type=== 'changeTitle'){
        return title = action.payload
    }
    return title;
}

const lastAction = (lastAction = null, action) => {
  return action
}

const user = (user = {}, action) => {
    if(action.type=== 'user'){
        return user = action.payload
    }
    return user;
}

const showBar = (showBar = true, action) => {
    switch(action.type){
        case 'hideBar':
            return false;
        default:
            return showBar;
    }
}

const merchant = (merchant = {}, action) => {
    switch(action.type){
        case 'fetchMerchant':
            return Object.assign({}, merchant, action.payload);
        default: 
            return merchant;
    }
}

const scrollTop = (scrollTop = false, action) => {
    switch(action.type){
        case 'scrollTop':
            return document.body.scrollTop === 0;
        default: 
            return scrollTop;
    }
}

const scroll = (scroll = {pos: 0, direction: 'down'}, action) => {
    if(action.type === 'scroll'){
        if((action.payload - scroll.pos) > 0){
            return scroll = {pos: action.payload, direction: 'down'};
        }
        scroll = {pos: action.payload, direction: 'up'};
    }
    return scroll;
}
export default {mask, merchant, user, title, showBar, scroll, lastAction}
// Code goes here
(function(window){

window.onload = function() {

var startPosition = null,
  endPosition = null,
  tabsContainer = document.getElementById('tabs-container'),
  tabs = document.getElementById('tabs-move'),
  lastTab = tabs.getElementsByClassName('tab').length - 1,
  tabsLink = document.getElementsByClassName('tabs-link')[0],
  tabsLinkArray = document.getElementsByClassName('tab-link'),
  indicator = document.getElementsByClassName('indicator')[0],
  startTranslate = 0,
  endTranslate = -100 * lastTab,
  currentTranslate = startTranslate,
  sliding = false,
  distanceToChangeView = 150,
  touchOffset = 50,
  currentTab = 0,
  changingTab = false,

  indicatorMargin = 0,
  prevTab = {},
  nextTab = {},
  containerWdith = tabsContainer.clientWidth;
  currentTranslateIndicator = 0;

[].forEach.call( tabsLinkArray, function(element, index) {
  element.setAttribute('data-id', index);
} );

tabsLinkArray[currentTab].classList.add('active');

var a = tabsLinkArray[currentTab+1].getBoundingClientRect();

nextTab = {
  id: currentTab+1,
  width: tabsLinkArray[currentTab+1].clientWidth,
  marginLeft: Math.floor(a.width/2 + a.left + tabsLink.scrollLeft)
}
//console.log( nextTab );
moveIndicator();

tabs.addEventListener('touchend', mouseUp);
tabs.addEventListener('touchstart', mouseDown);
tabs.addEventListener('touchmove', mouseMove);
tabsLink.addEventListener('click', tabLink);

function updateIndicatorWidth(){
  indicator.style.transform =  "scaleX(" + tabsLinkArray[currentTab].clientWidth + ")";
  currentTranslateIndicator = tabsLinkArray[currentTab].clientWidth;
}

function updateIndicatorPosition(){
  var currentTabDistance = tabsLinkArray[currentTab].getBoundingClientRect();
  indicatorMargin = Math.floor(currentTabDistance.width/2 + currentTabDistance.left + tabsLink.scrollLeft);
  indicator.style.marginLeft = indicatorMargin +'px';
}

function moveIndicator(){
  updateIndicatorWidth();
  updateIndicatorPosition();
}

function tabLink(event){
  if( changingTab ){ return; }

  changingTab = true;

  setTransition();
  tabsLinkArray[currentTab].classList.remove('active');
  currentTab = event.target.getAttribute('data-id');
  currentTranslate = currentTab*-100;
  setTranslationPercen( currentTranslate );
  tabsLinkArray[currentTab].classList.add('active');

  moveIndicator();

  changingTab = false;
}

function mouseUp(event) {
  
  sliding = false;
  
  setTransition();
  tabsLinkArray[currentTab].classList.remove('active');
  
  if ( moveToLeftView() ) {
    currentTab--;
    calcTranslation();
    setTranslationPercen( currentTranslate );
    
    var currentTabDistance = tabsLinkArray[ currentTab ].getBoundingClientRect();
      currentTabLeftDistance = currentTabDistance.left;

    if( currentTabLeftDistance < 0 ){
      tabsLink.scrollLeft = tabsLink.scrollLeft + currentTabLeftDistance;
    }else if ( currentTabDistance.right > tabsLink.clientWidth ){
      tabsLink.scrollLeft = currentTabDistance.right - tabsLink.clientWidth;
    }

  } else if ( moveToRightView() ) {
    currentTab++;
    calcTranslation();
    setTranslationPercen( currentTranslate );

    var currentTabDistance = tabsLinkArray[ currentTab ].getBoundingClientRect(),
      currentTabRightDistance = currentTabDistance.right;

    if( tabsLink.clientWidth < currentTabRightDistance ){
      tabsLink.scrollLeft = tabsLink.scrollLeft + currentTabRightDistance - tabsLink.clientWidth;
    }else if( currentTabRightDistance < 0 ){
      tabsLink.scrollLeft = tabsLink.scrollLeft + currentTabDistance.left;
    }
    
  } else if ( leftLimit() ) {
    setTranslationPercen( startTranslate );
    
  } else if ( rightLimit() ) {
    setTranslationPercen( endTranslate );
    
  } else {
    setTranslationPercen( currentTranslate );
  }
  
  tabsLinkArray[currentTab].classList.add('active');
  moveIndicator();
  
}

function mouseDown(event) {
  sliding = true;
  startPosition = event.touches[0].clientX;
}

function mouseMove(event){
  
  if (!sliding) {
    return;
  }
  endPosition = event.touches[0].clientX;

  removeTransition();

  if ( toRight( event ) ) {
    setTranslation( "calc( " + (event.touches[0].clientX - touchOffset - startPosition) + "px + " + currentTranslate + "% )" );
    //indicator.style.marginLeft = indicatorMargin + (event.touches[0].clientX - touchOffset - startPosition) +'px';

    var vistaRespectoPantalla = containerWdith / (event.touches[0].clientX - touchOffset - startPosition);
    
    var currentTab = {
      id: 0,
      width: tabsLinkArray[0].clientWidth,
      marginLeft: Math.floor(tabsLinkArray[0].clientWidth/2 + tabsLinkArray[0].getBoundingClientRect().left + tabsLink.scrollLeft)
    }
    
    var auxWidth = nextTab.marginLeft - currentTab.marginLeft;
    var newPos = auxWidth / vistaRespectoPantalla;
    indicator.style.marginLeft = indicatorMargin - newPos +'px';

  } else if ( toLeft( event ) ) {
    setTranslation( "calc( " + currentTranslate + "% - " + (startPosition - event.touches[0].clientX - touchOffset) + "px)" );

    var vistaRespectoPantalla = containerWdith / (startPosition - event.touches[0].clientX - touchOffset);
    
    var currentTab = {
      id: 0,
      width: tabsLinkArray[0].clientWidth,
      marginLeft: Math.floor(tabsLinkArray[0].clientWidth/2 + tabsLinkArray[0].getBoundingClientRect().left + tabsLink.scrollLeft)
    }
    
    var auxWidth = nextTab.marginLeft - currentTab.marginLeft;
    var newPos = auxWidth / vistaRespectoPantalla;
    indicator.style.marginLeft = indicatorMargin + newPos +'px';

    //indicator.style.transform =  "scaleX(" + Math.floor(tabsLinkArray[0].clientWidth - newPos) + ")";
    //console.log( tabsLinkArray[0].clientWidth - Math.floor(newPos) );
    /*var repectoAnchuras = currentTab.width / nextTab.width;
    indicator.style.transform =  "scaleX(" + currentTranslateIndicator - Math.floor(repectoAnchuras) + ")";
    currentTranslateIndicator = currentTranslateIndicator - Math.floor(repectoAnchuras);
    console.log(currentTranslateIndicator);*/

  }

}

function setTranslation( translation ){
  tabs.style.transform = "translateX(" + translation + ")";
}

function setTranslationPercen( translation ){
  setTranslation( translation+'%' );
}

function setTransition(){
  tabs.style.transition = "transform 0.4s ease-out";
}

function removeTransition(){
  tabs.style.transition = "";
}

function toLeft(event){
  return event.touches[0].clientX < startPosition - touchOffset;
}

function toRight(event){
  return event.touches[0].clientX > startPosition + touchOffset;
}

function leftLimit(){
  return currentTranslate === startTranslate;
}

function rightLimit(){
  return currentTranslate === endTranslate;
}

function moveToRightView(){
  return startPosition > endPosition&&
    startPosition - endPosition > distanceToChangeView &&
    !rightLimit();
}

function moveToLeftView(){
  return endPosition > startPosition &&
    endPosition - startPosition > distanceToChangeView &&
    !leftLimit();
}

function calcTranslation(){
  currentTranslate = currentTab * -100;
}

}

})(window);
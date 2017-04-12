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

// Obtener datos de las pestañas  
var tabsData = [ ];

[].forEach.call( tabsLinkArray, setData);

function setData( element, index ){
  element.setAttribute('data-id', index);

  var tab = {
    id: index,
    width: element.getBoundingClientRect().width
  };
  tab.center = tab.width/2;

  if( index ){
    tab.left = tabsData[index-1].right;
    tab.right = tab.left + tab.width;
  }else{
    tab.left = 0;
    tab.right = tab.width;
  }

  tab.marginLeft = tab.left + tab.center;

  tabsData.push(tab);

}

tabsLinkArray[currentTab].classList.add('active');

var a = tabsLinkArray[currentTab+1].getBoundingClientRect();

nextTab = tabsData[currentTab+1];

/*nextTab = {
  id: currentTab+1,
  width: tabsLinkArray[currentTab+1].clientWidth,
  marginLeft: Math.floor(a.width/2 + a.left + tabsLink.scrollLeft)
}*/

previousTab = null;

moveIndicator();

tabs.addEventListener('touchend', mouseUp);
tabs.addEventListener('touchstart', mouseDown);
tabs.addEventListener('touchmove', mouseMove);
tabsLink.addEventListener('click', tabLink);

function updateIndicatorWidth(){
  indicator.style.transform =  "scaleX(" + tabsData[currentTab].width + ")";
  currentTranslateIndicator = tabsData[currentTab].width;
}

function updateIndicatorPosition(){
  indicatorMargin = tabsData[currentTab].marginLeft;
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

    nextTab = tabsData[ currentTab ];

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

    previousTab = tabsData[ currentTab - 1 ];

  } else if ( moveToRightView() ) {

    previousTab = tabsData[ currentTab ];

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

    nextTab = tabsData[ currentTab+1 ];
    
  } 
  /*else if ( leftLimit() ) {
    setTranslationPercen( startTranslate );
    
  } else if ( rightLimit() ) {
    setTranslationPercen( endTranslate );
    
  } */
  else {
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
  
  if (!sliding ) {
    return;
  }
  endPosition = event.touches[0].clientX;

  removeTransition();

  if ( toRight( event ) && !leftLimit() ) {

    var touchMove = event.touches[0].clientX - touchOffset - startPosition;

    setTranslation( "calc( " + touchMove + "px + " + currentTranslate + "% )" );

    var vistaRespectoPantalla = containerWdith / touchMove;
    
    var currentTab2 = tabsData[ currentTab ];
    
    //var auxWidth = nextTab.marginLeft - currentTab2.marginLeft;
    var auxWidth = currentTab2.marginLeft -previousTab.marginLeft;
    var newPos = auxWidth / vistaRespectoPantalla;
    indicator.style.marginLeft = indicatorMargin - newPos +'px';

  } else if ( toLeft( event ) && !rightLimit() ) {

    var touchMove = startPosition - event.touches[0].clientX - touchOffset;

    setTranslation( "calc( " + currentTranslate + "% - " + touchMove + "px)" );

    var vistaRespectoPantalla = containerWdith / touchMove;
    
    var currentTab2 = tabsData[ currentTab ];
    
    var auxWidth = nextTab.marginLeft - currentTab2.marginLeft;
    var newPos = auxWidth / vistaRespectoPantalla;
    indicator.style.marginLeft = indicatorMargin + newPos +'px';

  }

}

function setTranslation( translation ){
  tabs.style.transform = "translateX(" + translation + ")";
}

function setTranslationPercen( translation ){
  setTranslation( translation+'%' );
}

function setTransition(){
  tabs.style.transition = "transform 0.3s";
  //indicator.style.transition = "transform 0.3s, margin 0.3s";
  indicator.style.transition = "transform 0.3s";
}

function removeTransition(){
  tabs.style.transition = "";
  indicator.style.transition = "";
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
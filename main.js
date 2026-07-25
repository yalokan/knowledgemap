const container = document.getElementById('graph');
const options = {
   layout: {
    randomSeed: undefined,
    improvedLayout:true,
    clusterThreshold: 150,
    hierarchical: {
      enabled:true,
      levelSeparation: 150,
      nodeSpacing: 100,
      treeSpacing: 400,
      blockShifting: false,
      edgeMinimization: false,
      parentCentralization: true,
      direction: 'UD',        // UD, DU, LR, RL
      sortMethod: 'directed',  // hubsize, directed
      shakeTowards: 'roots'  // roots, leaves
    }
  },
    physics:{
      enabled: true,
      hierarchicalRepulsion: {
        centralGravity: 0.0,
        springLength: 100,
        springConstant: 0.01,
        nodeDistance: 120,
        damping: 0.09,
        avoidOverlap: 0
      }
    },
    interaction: {
      dragNodes: false,
      dragView: true,
      zoomView: true
    },
    nodes: {
      fixed: false,
      color: {
        border: '#49e0e8',
        background: '#282671',
        highlight: {
          border: '#49e0e8',
          background: '#282671'},
      },
      font: {
        color: 'rgb(252, 252, 252)',
      },
      shape: 'box',
    }
}
let nodes, edges, info, token;
let auth = false

  fetch('data.json')
  .then(response => response.json())
  .then(data => processData(data))
  .catch(error => console.error('Failed to load data.json:', error))

  //Отрисовка

function processData(data) {
  nodes = data.map(item => ({ id: item.id, label: item.title }))
  edges = new vis.DataSet(
    data
      .map(item => ({ from: item.parent, to: item.id }))
      .filter(edge => edge.to !== '')
  )
  info = data.map(item => ({ id: item.id, title: item.title, description: item.description, related: item.related }))
  
  const dataset = { nodes, edges }
  const network = new vis.Network(container, dataset, options)

//Взаимодействие с юзером

network.on("click", function (params) {
    if (params.nodes.length === 0) return;
    document.getElementById('node-title').textContent = info.find(item => item.id === params.nodes[0]).title
    document.getElementById('node-description').textContent = info.find(item => item.id === params.nodes[0]).description
    
    

    let relatedId = info.find(item => item.id === params.nodes[0]).related
    console.log('Related ID:', relatedId)
    let relatedTitles = relatedId.map(id => info.find(item => item.id === id)?.title || ' ')
    console.log('Related Titles:', relatedTitles)
    document.getElementById('node-related').innerHTML = relatedTitles.map(title => `<a href="#" data-id="${info.find(item => item.title === title)?.id || ''}">${title}</a>`).join('<br>')
    
    
    document.getElementById('info-panel').classList.add('open')
  })
      
  
  document.getElementById('node-related').addEventListener('click', function(event){
    if (event.target.tagName === 'A'){
      const id = event.target.dataset.id
      network.setSelection({nodes: [id]})
      network.focus(id, {scale: 1.5, locked: false, animation: {duration: 1000, easingFunction: 'easeInOutQuad'}})
           
        
      }
    })

}

//Тулбар

const authDialog = document.getElementById('authorization-dialog');
const addNodeDialog = document.getElementById('add-node-dialog');
document.getElementById('settings-button').addEventListener('click', function() {
  console.log('Settings button clicked');
});
document.getElementById('search-button').addEventListener('click', function() {
  console.log('Search button clicked');
});


document.getElementById('authorization-button').addEventListener('click', function() {
  if(auth === false){
    authDialog.showModal();
  }
  else{
    auth = false
    document.getElementById('add-node-button').classList.add('disabled');
    console.log('Unauth function')
  }
});
document.getElementById('cancelAuthButton').addEventListener('click', function() {
  authDialog.close();
})
document.getElementById('authorization-form').addEventListener('submit', function(event) {
  event.preventDefault();
  let token = document.getElementById('token').value;
  Authorization(token)
  .then(() =>{
    if(auth === true){
    authDialog.close();
    document.getElementById('add-node-button').classList.remove('hidden');
    sessionStorage.setItem('github_token', token)
}})
})

document.getElementById('add-node-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const form = document.getElementById('add-node-form');
  const formData = new FormData(form);
  const newNode = {
    id: formData.get('id'),
    title: formData.get('title'),
    parent: formData.get('parent'),
    related: formData.getAll('related'),
    description: formData.get('description'),
  };
  console.log('New node data:', newNode);
  addNodeDialog.close();   
  uploadData(newNode)
  })
document.getElementById('add-node-button').addEventListener('click', function() {
  info.forEach(node => {
  const option = document.createElement('option');
  option.value = node.id;
  option.textContent = node.title;
  document.getElementById('input-node-parent').appendChild(option);
  document.getElementById('input-node-related').appendChild(option.cloneNode(true));
})
  addNodeDialog.showModal();
});
document.getElementById('cancelAddNodeButton').addEventListener('click', function() {
  addNodeDialog.close();
})
//JQUERY, REACT

/*const $ = document.getElementById.bind(document);
$('add-node-form').addEventListener('submit', function(event) {
*/
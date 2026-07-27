const owner = 'Yalokan'
const repo = 'TheoryOfEveryThing'

async function Authorization(token){
    let serverResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, { 
        method: 'POST',
        headers:{
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            "X-GitHub-Api-Version": "2026-03-10",
            'Content-type' : 'application/json'
        },
        body: JSON.stringify({
            content: 'Auth test',
            encoding: 'utf-8'
        })
    })
    if(!serverResponse.ok){
        console.log(`Something went wrong. Status code: ${serverResponse.status}`)
    }
    else{      
        console.log('Auth successful')
        console.log(serverResponse)
        auth = true
    }

    //TODO : Make animated notification window saying whether auth went successfuly
}
async function uploadData(newNode){
    if(auth === false){
        console.log('You are not authorized. Please authorize first.')
        return
    }
    const token = sessionStorage.getItem('github_token')
    let serverResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data.json`, { 
        method: 'GET',
        headers:{
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            "X-GitHub-Api-Version": "2026-03-10",
            'Content-type' : 'application/json'
        }
    })
    const data = await serverResponse.json()
    const sha = data.sha
    const content = JSON.parse(atob(data.content))
    

    content.push(newNode)

    const updatedContent = btoa(JSON.stringify(content, null, 2))
    serverResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data.json`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            "X-GitHub-Api-Version": "2026-03-10",
            'Content-type' : 'application/json'
        },
        body: JSON.stringify({
            message: 'Update data.json',
            content: updatedContent,
            sha: sha
        })
    })
    if(!serverResponse.ok){
        console.log(`Something went wrong. Status code: ${serverResponse.status}`)
    }
    else{
        console.log('Data uploaded successfully')
        console.log(serverResponse)
        fetch('data.json')
        .then(response => response.json())
        .then(data => processData(data))
        .catch(error => console.error('Failed to load data.json:', error))
    }
}

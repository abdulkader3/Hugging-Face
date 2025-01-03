import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import './App.css'
import Home from './Page/Home'

function App() {
  const OpenAI = createBrowserRouter(
    createRoutesFromElements(
        <Route>
          <Route path="/" element={<Home/>} />
        </Route>
    )
  )
 

  return (
    <>
      <RouterProvider router={OpenAI} />
      
    </>
  )
}

export default App

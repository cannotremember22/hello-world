import 'regenerator-runtime/runtime'
import React from 'react'

import './assets/css/global.css'

import {login, logout, get_greeting, set_greeting} from './assets/js/near/utils'
import getConfig from './assets/js/near/config'


export default function App() {
  // use React Hooks to store greeting in component state
  const [greeting, setGreeting] = React.useState()

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = React.useState(true)

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = React.useState(false)

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(
    () => {
      // get_greeting is in near/utils.js
      get_greeting()
        .then(greetingFromContract => {
          setGreeting('')
        })
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    []
  )

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <div style={{ with: '100%', height: '100vh', display: 'flex' }}>
        <img style={{ height: '100%', borderRadius: '0 20px 20px 0' }} src="https://cdn.dribbble.com/users/1299339/screenshots/2972130/hello_world.gif" />
        <div style={{ height: '100%', flexGrow: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '100px' }}>
          <h1>
            Welcome to Near
          </h1>
          <button onClick={login}>Sign in</button>
        </div>
      </div>
    )
  }

  return (
    <>
      
    <div style={{ height: 'calc(100vh - 40px)', display: 'flex' }}>
      <div style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
        <h1>
          Welcome to Near
        </h1>
        <p>User: {window.accountId}</p>
        <b>Hello {greeting}!</b>
      </div>
      <div style={{ width: '50%', display: 'flex', alignItems: 'center', padding: '20px' }}>
        <form style={{ width: '100%',border: '10px solid #342c2c', borderRadius: '25px', padding: '30px' }} onSubmit={async event => {
          event.preventDefault()

          const { fieldset, greeting } = event.target.elements

          const newGreeting = greeting.value

          fieldset.disabled = true

          try {
            await set_greeting(newGreeting)
          } catch (e) {
            alert(
              'Something went wrong! ' +
              'Maybe you need to sign out and back in? ' +
              'Check your browser console for more info.'
            )
            throw e
          } finally {
            fieldset.disabled = false
          }

          setGreeting(newGreeting)

          setShowNotification(true)

          setTimeout(() => {
            setShowNotification(false)
          }, 11000)
        }}>
          <fieldset id="fieldset">
            <label
              htmlFor="greeting"
              style={{
                display: 'block',
                color: 'var(--gray)',
                marginBottom: '0.5em'
              }}
            >
              Change greeting
            </label>
            <div style={{ display: 'flex' }}>
              <input
                autoComplete="off"
                defaultValue={greeting}
                id="greeting"
                onChange={e => setButtonDisabled(e.target.value === greeting)}
                style={{ flex: 1 }}
              />
              <button
                disabled={buttonDisabled}
                style={{ borderRadius: '0 5px 5px 0' }}
              >
                Save
              </button>
            </div>
          </fieldset>
        </form>
      </div>
      {/*! 
       */}
    </div>
    <button className="link" style={{ float: 'right' }} onClick={logout}>
      Sign out
    </button>
    {showNotification && <Notification />}
  </>
  )
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const { networkId } = getConfig(process.env.NODE_ENV || 'development')
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`

  return (
    <aside>
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
        {window.accountId}
      </a>
      {' '/* React trims whitespace around tags; insert literal space character when needed */}
      called method: 'set_greeting' in contract:
      {' '}
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.contract.contractId}`}>
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  )
}

import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import PropTypes from 'prop-types'
import UnlockPropTypes from '../propTypes'
import Layout from '../components/interface/Layout'
import CreatorAccount from '../components/creator/CreatorAccount'
import CreatorLocks from '../components/creator/CreatorLocks'
import DeveloperOverlay from '../components/developer/DeveloperOverlay'
import BrowserOnly from '../components/helpers/BrowserOnly'
import GlobalErrorConsumer from '../components/interface/GlobalErrorConsumer'
import GlobalErrorProvider from '../utils/GlobalErrorProvider'
import { pageTitle } from '../constants'

export const Dashboard = ({ account, network, lockFeed }) => {
  return (
    <GlobalErrorProvider>
      <GlobalErrorConsumer>
        <Layout title="Creator Dashboard">
          <Head>
            <title>{pageTitle('Dashboard')}</title>
          </Head>
          <BrowserOnly>
            <CreatorAccount network={network} account={account} />
            <CreatorLocks lockFeed={lockFeed} />
            <DeveloperOverlay />
          </BrowserOnly>
        </Layout>
      </GlobalErrorConsumer>
    </GlobalErrorProvider>
  )
}

Dashboard.displayName = 'Dashboard'

Dashboard.propTypes = {
  account: UnlockPropTypes.account.isRequired,
  network: UnlockPropTypes.network.isRequired,
  lockFeed: PropTypes.arrayOf(UnlockPropTypes.lock),
}

Dashboard.defaultProps = {
  lockFeed: [],
}

export const mapStateToProps = state => {
  // We want to display newer locks first, so sort the locks by blockNumber in descending order
  const locksComparator = (a, b) => {
    // Newly created locks may not have a transaction associated just yet
    // -- those always go right to the top
    if (!state.transactions[a.transaction]) {
      return -1
    }
    if (!state.transactions[b.transaction]) {
      return 1
    }
    return (
      state.transactions[b.transaction].blockNumber -
      state.transactions[a.transaction].blockNumber
    )
  }
  const lockFeed = Object.values(state.locks).sort(locksComparator)
  return {
    account: state.account,
    network: state.network,
    lockFeed,
  }
}

export default connect(mapStateToProps)(Dashboard)

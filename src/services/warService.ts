const API_BASE = 'https://helldiverstrainingmanual.com/api/v1';

export const WarService = {
  async getActiveCampaigns() {
    const response = await fetch(`${API_BASE}/war/campaign`);
    return await response.json();
  },

  async getPlanetsStaticInfo() {
    const response = await fetch(`${API_BASE}/war/info`);
    const data = await response.json();
    return data.planetInfos;
  }
};
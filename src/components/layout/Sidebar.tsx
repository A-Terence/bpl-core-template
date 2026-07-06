import { useState, useEffect } from 'react';

import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import { ChevronDown, Lock } from 'lucide-react';

import { useTenant } from '../../context/TenantContext';

import { SIDEBAR_NAV, getParentPath } from '../../config/nav';
import { resolveSettingsNav } from '../../config/settingsNav';

import type { NavGroupDef } from '../../config/nav';

import type { FeatureId } from '../../config/features';



interface Props {

  mobileOpen?: boolean;

  onCloseMobile?: () => void;

}



function NavGroupRow({

  group,

  openGroup,

  onToggle,

  onCloseMobile,

}: {

  group: NavGroupDef;

  openGroup: string | null;

  onToggle: (path: string, defaultChild?: string) => void;

  onCloseMobile?: () => void;

}) {

  const location = useLocation();

  const Icon = group.icon;

  const isOpen = openGroup === group.path;

  const isActive = group.path === '/'

    ? location.pathname === '/'

    : location.pathname === group.path || location.pathname.startsWith(`${group.path}/`);



  if (!group.children) {

    return (

      <NavLink

        to={group.path}

        end={group.path === '/'}

        onClick={onCloseMobile}

        className={({ isActive: navActive }) => `bpl-nav-item${navActive ? ' active' : ''}`}

      >

        <Icon size={15} className="bpl-nav-icon" />

        <span>{group.label}</span>

      </NavLink>

    );

  }



  const defaultChildPath =
    group.children.some(c => c.path === group.path)
      ? group.path
      : group.children[0].path;

  return (
    <div className="bpl-nav-group">
      <button
        type="button"
        className={`bpl-nav-item bpl-nav-group-btn${isActive ? ' active' : ''}`}
        onClick={() => onToggle(group.path, defaultChildPath)}
      >

        <Icon size={15} className="bpl-nav-icon" />

        <span>{group.label}</span>

        <ChevronDown size={13} className={`bpl-nav-chevron${isOpen ? ' open' : ''}`} />

      </button>

      <div

        className="bpl-nav-children-wrap"

        style={{ maxHeight: isOpen ? `${group.children.length * 34}px` : '0' }}

      >

        <div className="bpl-nav-children">

          {group.children.map(child => {

            const SubIcon = child.icon;

            return (

              <NavLink

                key={child.path}

                to={child.path}

                end

                onClick={onCloseMobile}

                className={({ isActive: childActive }) =>

                  `bpl-nav-item bpl-nav-child${childActive ? ' active' : ''}`

                }

              >

                <SubIcon size={13} className="bpl-nav-icon" />

                <span>{child.label}</span>

              </NavLink>

            );

          })}

        </div>

      </div>

    </div>

  );

}



export default function Sidebar({ mobileOpen, onCloseMobile }: Props) {

  const { tenant, isEnabled, unavailableFeatures } = useTenant();

  const location = useLocation();

  const navigate = useNavigate();

  const [unavailOpen, setUnavailOpen] = useState(true);



  const settingsNav = resolveSettingsNav(tenant);

  const [openGroup, setOpenGroup] = useState<string | null>(() => {
    if (location.pathname.startsWith('/settings')) return settingsNav.path;
    return getParentPath(location.pathname, SIDEBAR_NAV);
  });

  useEffect(() => {
    if (location.pathname.startsWith('/settings')) {
      setOpenGroup(settingsNav.path);
    } else {
      const parent = getParentPath(location.pathname, SIDEBAR_NAV);
      if (parent) setOpenGroup(parent);
    }
  }, [location.pathname, settingsNav.path]);



  const toggleGroup = (path: string, defaultChild?: string) => {

    if (openGroup === path) {

      setOpenGroup(null);

    } else {

      setOpenGroup(path);

      if (defaultChild) navigate(defaultChild);

    }

  };



  const isGroupEnabled = (featureId: FeatureId | null) =>

    featureId === null || isEnabled(featureId);



  const visibleNav = SIDEBAR_NAV.filter(g => isGroupEnabled(g.featureId));



  return (

    <aside className={`bpl-sidebar${mobileOpen ? ' open' : ''}`}>

      <div className="bpl-sidebar-logo">

        <div className="bpl-sidebar-brand-header">

          <div className="bpl-sidebar-logo-badge">

            <img src={tenant.branding.logo} alt={tenant.branding.clientName} />

          </div>

          <div className="bpl-sidebar-brand-block">
            <div className="bpl-sidebar-brand-name">{tenant.branding.clientName}</div>
            <div className="bpl-sidebar-brand-text">{tenant.branding.platformName}</div>
          </div>

        </div>

      </div>



      <nav className="bpl-sidebar-nav">

        {visibleNav.map(group => (

          <NavGroupRow

            key={group.path}

            group={group}

            openGroup={openGroup}

            onToggle={toggleGroup}

            onCloseMobile={onCloseMobile}

          />

        ))}



        {tenant.ui.showUnavailableFeatures && (

          <>

            <button

              type="button"

              className="bpl-nav-item bpl-nav-unavail-toggle"

              onClick={() => setUnavailOpen(o => !o)}

            >

              <Lock size={15} className="bpl-nav-icon" />

              <span>Unavailable features</span>

              <ChevronDown size={13} className={`bpl-nav-chevron${unavailOpen ? ' open' : ''}`} />

            </button>

            {unavailOpen &&

              unavailableFeatures.map(f => {

                const Icon = f.icon;

                return (

                  <div key={f.id} className="bpl-nav-item locked" style={{ cursor: 'not-allowed' }}>

                    <Icon size={15} className="bpl-nav-icon" />

                    <span>{f.label}</span>

                    <Lock size={12} className="bpl-nav-lock" />

                  </div>

                );

              })}

          </>

        )}

      </nav>



      <div className="bpl-sidebar-footer">

        {isEnabled('settings') && (

          <NavGroupRow

            group={settingsNav}

            openGroup={openGroup}

            onToggle={toggleGroup}

            onCloseMobile={onCloseMobile}

          />

        )}

      </div>

    </aside>

  );

}


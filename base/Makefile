include $(TOPDIR)/rules.mk

# Name and release number of this package
PKG_NAME:=basestation
PKG_VERSION:=0.1.0
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/basestation
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=Animal tracking basestation
  DEPENDS:=+awalwm2m +letmecreate
endef

define Package/basestation/description
	Awa Relay Example
endef

TARGET_CFLAGS += -I$(STAGING_DIR)/usr/include
TARGET_LDFLAGS += -L$(STAGING_DIR)/usr/lib

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) BaseStation/* $(PKG_BUILD_DIR)/
endef

define Build/Compile
	$(MAKE) -C $(PKG_BUILD_DIR) \
	$(TARGET_CONFIGURE_OPTS) \
	CFLAGS="$(TARGET_CFLAGS)" \
	LDFLAGS="$(TARGET_LDFLAGS)"
endef

define Package/basestation/install
	$(INSTALL_DIR) $(1)/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/basestation $(1)/bin/
endef

$(eval $(call BuildPackage,basestation))

include $(TOPDIR)/rules.mk

# Name and release number of this package
PKG_NAME:=camera_base
PKG_VERSION:=2.0.0
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/camera_base
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=Camera_base awa
  DEPENDS:=+awalwm2m +letmecreate
endef

define Package/camera_base/description
	Awa Camera_base example
endef

TARGET_CFLAGS += -I$(STAGING_DIR)/usr/include
TARGET_LDFLAGS += -L$(STAGING_DIR)/usr/lib

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
	$(CP) Camera_base/* $(PKG_BUILD_DIR)/
endef

define Build/Compile
	$(MAKE) -C $(PKG_BUILD_DIR) \
	$(TARGET_CONFIGURE_OPTS) \
	CFLAGS="$(TARGET_CFLAGS)" \
	LDFLAGS="$(TARGET_LDFLAGS)"
endef

define Package/camera_base/install
	$(INSTALL_DIR) $(1)/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/camera_base $(1)/bin/
endef

$(eval $(call BuildPackage,camera_base))

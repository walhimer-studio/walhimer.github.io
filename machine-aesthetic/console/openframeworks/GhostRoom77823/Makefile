# Local OF_ROOT override (written by scripts/setup-openframeworks.sh; not committed).
ifneq ($(wildcard config.make.local),)
	include config.make.local
endif

# When built from $OF_ROOT/apps/myApps/GhostRoom77823 (symlink cwd), go up three levels.
ifndef OF_ROOT
ifneq ($(findstring /apps/myApps/,$(CURDIR)),)
	OF_ROOT := $(abspath $(CURDIR)/../../..)
endif
endif

ifndef OF_ROOT
	OF_ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST)))/../../..)
endif

COMPILE_PROJECT_MK := $(OF_ROOT)/libs/openFrameworksCompiled/project/makefileCommon/compile.project.mk
ifeq ($(wildcard $(COMPILE_PROJECT_MK)),)
$(error OF_ROOT invalid — missing $(COMPILE_PROJECT_MK). Run ./scripts/setup-openframeworks.sh or export OF_ROOT=~/openFrameworks)
endif

# Attempt to load a config.make file.
ifneq ($(wildcard config.make),)
	include config.make
endif

include $(COMPILE_PROJECT_MK)

# Newer Xcode SDKs omit AGL on Apple Silicon.
PLATFORM_FRAMEWORKS := $(filter-out AGL,$(PLATFORM_FRAMEWORKS))
LDFLAGS := $(strip $(subst -framework AGL,,$(LDFLAGS)))

# Convenience alias (OF ships RunRelease; macOS app lives in bin/*.app).
.PHONY: Run
Run:
	@test -d bin/$(APPNAME).app || (echo "Build first: make -j4" >&2; exit 1)
	@open bin/$(APPNAME).app
